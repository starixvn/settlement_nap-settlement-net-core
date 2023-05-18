using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Criteria;
using Settlement.Sportsbook.MoveTickets.Models;
using Settlement.Sportsbook.MoveTickets.Requests;

namespace Settlement.Sportsbook.MoveTickets.Services;

public interface MoveTicketService
{
    Task<List<SportModel>> GetSportBook(GetMatchRequest request);

    Task<List<MoveTicketsMatchDetail>> GetMoveTicketsMatches(GetMoveTicketsMatchesRequest request);
}

public class MoveTicketServiceImp : MoveTicketService
{
    private readonly IDynamicRepository repository;
    private readonly IRefDataService refDataService;
    private readonly IMapper mapper;
    private readonly IMatchService matchService;
    private readonly AppSettingsKey appSettingsKey;

    public MoveTicketServiceImp(
        IDynamicRepository repository,
        IRefDataService refDataService,
        IMapper mapper,
        IMatchService matchService,
        IOptions<AppSettingsKey> appSettingsKey)
    {
        this.repository = repository;
        this.refDataService = refDataService;
        this.mapper = mapper;
        this.matchService = matchService;
        this.appSettingsKey = appSettingsKey.Value;
    }

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

        GetReferenceAction(matches);

        var sportBooks = matches.GroupBy(match => new { match.SportName, match.SportType })
                                .Select(sports => new SportModel
                                {
                                    Id = sports.Key.SportType,
                                    Name = sports.Key.SportName,
                                    Leagues = GroupLeague(sports)
                                }).ToList();

        return sportBooks;
    }

    private void GetReferenceAction(List<Match> data)
    {
        var listMatchId = data.Select(match => match.MatchId).ToList();
        var matchIds = string.Join(',', listMatchId);
        var criteria = new GetReferenceActionCriteria
        {
            MatchIds = matchIds
        };

        var referenceActions = repository.Fetch<ReferenceAction>(criteria).ToList();

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
        var isCalc = match.NewEventStatus.Equals(EventStatus.Refund, StringComparison.OrdinalIgnoreCase) || match.NewEventStatus.Equals(EventStatus.Completed, StringComparison.OrdinalIgnoreCase);

        return isCalc && (match.IsExistMarkedTicket || match.IsExistRunningTicket);
    }

    private async Task<MultiSportResult> FetchMatchesAndResultDetails(SportsbookCriteria criteria)
    {
        var matches = await MatchesAllSites(criteria);
        var resultDetails = await ResultDetailByMatchIds(matches);
        matchService.SetNewMatchInfo(matches);
        return new MultiSportResult
        {
            Matches = matches,
            ResultDetails = resultDetails
        };
    }

    private async Task<List<Match>> MatchesAllSites(SportsbookCriteria criteria)
    {
        var matches = new List<Match>();
        var isCentralDataBase = true;
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            var data = (await repository.FetchAsync<Match>(criteria)).ToList();

            if (isCentralDataBase)
            {
                matches = data;
                isCentralDataBase = false;
            }
            else
            {
                matchService.MergeMatches(matches, data);
            }
        }

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