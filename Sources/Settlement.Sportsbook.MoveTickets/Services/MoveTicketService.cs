using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Criteria;
using Settlement.Sportsbook.MoveTickets.Models;
using Settlement.Sportsbook.MoveTickets.Requests;
using Settlement.Sportsbook.MoveTickets.Services.MultipleServer;
using System.Text.Json;

namespace Settlement.Sportsbook.MoveTickets.Services;

public interface MoveTicketService
{
    Task<List<SportModel>> GetSportBook(GetMatchRequest request);

    Task<List<MoveTicketsMatchDetail>> GetMoveTicketsMatches(GetMoveTicketsMatchesRequest request);
}

public class MoveTicketServiceImp(
    IDynamicRepository repository,
    IRefDataService refDataService,
    IMapper mapper,
    IMatchService matchService,
        IOptions<AppSettingsKey> appSettingsKey,
        SiteMatchService siteMatchService) : MoveTicketService
{
    private readonly AppSettingsKey appSettingsKey = appSettingsKey.Value;

    public async Task<List<SportModel>> GetSportBook(GetMatchRequest request)
    {
        var criteria = mapper.Map<GetMatchRequest, SportsbookCriteria>(request);
        var data = await FetchMatchesAndResultDetails(criteria);
        var matchesByEachSport = GetMoreScore(data);

        var matches = new List<Match>();
        matchesByEachSport.ForEach(sport => sport.Matches.ForEach(match =>
        {
            match.RefDataService = refDataService;
            matches.Add(match);
        }));

        await GetReferenceAction(matches);

        var sportBooks = matches.GroupBy(match => new { match.SportName, match.SportType })
                                .Select(sports => new SportModel
                                {
                                    Id = sports.Key.SportType,
                                    Name = sports.Key.SportName,
                                    Leagues = GroupLeague(sports)
                                }).ToList();

        return sportBooks;
    }

    private async Task GetReferenceAction(List<Match> data)
    {
        var listMatchId = data.Select(match => match.MatchId).ToList();
        var matchIds = string.Join(',', listMatchId);
        var criteria = new GetReferenceActionCriteria
        {
            MatchIds = matchIds
        };

        var referenceActions = (await repository.FetchAsync<ReferenceAction>(criteria)).ToList();

        foreach (var match in data)
        {
            var referenceActionByMatchId = referenceActions.Where(item => item.MatchId == match.MatchId).ToList();
            match.ReferenceActions = referenceActionByMatchId;
        }
    }

    private List<MatchesBySportTypeModel> GetMoreScore(MultiSportResult data)
    {
        var matchesByEachSport = data.Matches.GroupBy(match => match.SportType)
                                            .Select(sports => new MatchesBySportTypeModel { SportType = sports.Key, Matches = sports.ToList() })
                                            .ToList();
        foreach (var item in matchesByEachSport)
        {
            item.Matches = matchService.GetScoreForMatchBySportType(item.Matches, data.ResultDetails, item.SportType, 0);
        }

        return matchesByEachSport;
    }

    private static List<LeagueModel> GroupLeague(IEnumerable<Match> sports)
    {
        return sports.GroupBy(sport => new
        {
            sport.LeagueName,
            sport.LeagueId
        })
        .OrderBy(league => league.Key.LeagueName)
        .Select(league => new LeagueModel
        {
            Name = league.Key.LeagueName,
            LeagueId = league.Key.LeagueId,
            Matches = SortMatch(league)
        }).ToList();
    }

    private static List<Match> SortMatch(IEnumerable<Match> leagues)
    {
        var eventStatuses = new List<string>
            {
                "running",
                "result pending",
                "postponed",
                "internal",
                "closed",
                "completed",
                "refund ht",
                "refund ft",
                "refund"
            };

        return leagues.OrderBy(PositionByEventStatus)
                      .ThenBy(match => eventStatuses.IndexOf(match.NewEventStatus.ToLowerInvariant()))
                      .ThenBy(match => match.KickOffTime)
                      .ThenBy(match => match.MatchId)
                      .ToList();
    }

    private static int PositionByEventStatus(Match match)
    {
        const int firstPosition = 1;
        const int secondPosition = 2;
        return IsSettleAndHasRunningTicket(match) ? firstPosition : secondPosition;
    }

    private static bool IsSettleAndHasRunningTicket(Match match)
    {
        var isCalc = match.NewEventStatus.Equals(EventStatus.Refund, StringComparison.OrdinalIgnoreCase)
            || match.NewEventStatus.Equals(EventStatus.Completed, StringComparison.OrdinalIgnoreCase);

        return isCalc && (match.IsExistMarkedTicket || match.IsExistRunningTicket);
    }

    private async Task<MultiSportResult> FetchMatchesAndResultDetails(SportsbookCriteria criteria)
    {
        var matches = await GetMatchesAllInfo(criteria);

        var resultDetails = await ResultDetailByMatchIds(matches);

        matchService.SetNewMatchInfo(matches);

        return new MultiSportResult
        {
            Matches = matches,
            ResultDetails = resultDetails
        };
    }

    private async Task<IEnumerable<SiteMatch>> GetTicketInfoAllDbSites(OSTicketInfoSelCriteria criteria)
    {
        var siteDbServer = appSettingsKey.SiteDbServer;
        var getTicketInfoTasks = siteDbServer.Select(s => GetTicketInfo(s, criteria));

        var result = await Task.WhenAll(getTicketInfoTasks.ToArray());

        var newResult = result.SelectMany(x => x);

        return newResult;
    }

    private async Task<IEnumerable<SiteMatch>> GetTicketInfo(string server, OSTicketInfoSelCriteria criteria)
    {
        criteria.DbServer = server;

        return await repository.FetchAsync<SiteMatch>(criteria);
    }

    private async Task<IEnumerable<SiteMatch>> GetOSTicketInfo(List<Match> matches)
    {
        var matchesInfo = matches.Select(x => new MatchRequest
        {
            MatchId = x.MatchId,
            ChildMatchType = x.ChildMatchType,
            EventStatus = x.EventStatus,
            SportType = x.SportType,
        });

        var criteria = new OSTicketInfoSelCriteria
        {
            MatchInfo = JsonSerializer.Serialize(matchesInfo),
        };

        return await GetTicketInfoAllDbSites(criteria);
    }

    private void SetMatchTicketInfo(List<Match> matches, List<SiteMatch> siteMatches)
    {
        foreach (var item in matches)
        {
            var ticketInfo = siteMatches.Where(x => x.MatchId == item.MatchId).ToList();

            item.SuspenderFullTime = ticketInfo.FirstOrDefault(x => string.IsNullOrEmpty(x.SuspenderFullTime))?.SuspenderFullTime;
            item.SuspenderHalfTime = ticketInfo.FirstOrDefault(x => string.IsNullOrEmpty(x.SuspenderHalfTime))?.SuspenderHalfTime;

            item.IsExistEarlyBetTypes = ticketInfo.Exists(x => x.IsExistEarlyBetTypes);
            item.IsRunningEarlyBetTypes = ticketInfo.Exists(x => x.IsRunningEarlyBetTypes);
            item.IsWaitingEarlyBetTypes = ticketInfo.Exists(x => x.IsWaitingEarlyBetTypes);
            item.IsExistRunningTicket = ticketInfo.Exists(x => x.IsExistRunningTicket);
            item.IsExistMarkedTicket = ticketInfo.Exists(x => x.IsExistMarkedTicket);
            item.IsCalculatingSingle = siteMatchService.IsCalculatingSingle(ticketInfo);
        }
    }

    private async Task<List<Match>> GetMatchesAllInfo(SportsbookCriteria criteria)
    {
        var matches = (await repository.FetchAsync<Match>(criteria)).ToList();
        var siteMatches = (await GetOSTicketInfo(matches)).ToList();

        SetMatchTicketInfo(matches, siteMatches);

        return matches;
    }

    private async Task<List<ResultDetail>> ResultDetailByMatchIds(List<Match> matches)
    {
        var listMatchId = string.Join(",", matches.Select(match => match.MatchId.ToString()).ToArray());
        var resultDetailCriteria = new GetResultDetailCriteria { MatchIdList = listMatchId };
        return (await repository.FetchAsync<ResultDetail>(resultDetailCriteria)).ToList();
    }

    public async Task<List<MoveTicketsMatchDetail>> GetMoveTicketsMatches(GetMoveTicketsMatchesRequest request)
    {
        var criteria = mapper.Map<GetMoveTicketsMatchesRequest, GetMoveTicketsMatchesCriteria>(request);

        var matches = await repository.FetchAsync<MoveTicketsMatchDetail>(criteria);
        var moveTicketsMatchDetails = matches.ToList();
        foreach (var match in moveTicketsMatchDetails)
        {
            match.RefDataService = refDataService;
        }

        return moveTicketsMatchDetails.ToList();
    }
}