namespace Settlement.EventManagement.Services.MultiSports;

using Criteria;
using Fanex.Data.Repository;
using Requests;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Models.MultiSports;
using System.Text.Json;
using Match = Models.MultiSports.Match;
using MatchFilterTuple = (List<Models.MultiSports.Match> Matches, List<MatchOverStatus> MatchOverStatuses, List<ParentChildMatchFilter> ParentChildMatchFilters);

public interface IMultiSportService
{
    Task<List<SportModel>> GetSportBook(FilterMultiSportRequest request, bool isLeader);
}

public class MultiSportServiceImp(
    IDynamicRepository repository,
    IMatchService matchService,
    IMapper mapper,
    SiteMatchService siteMatchService,
    IOptions<AppSettingsKey> appSettingsKey)
    : IMultiSportService
{
    private const int PARALLEL_BATCH_SIZE = 100;

    private static readonly List<int> SportSortingOrder =
    [
        SportType.Tennis,
        SportType.ESports,
        SportType.BasketBall,
        SportType.Badminton
    ];

    public async Task<List<SportModel>> GetSportBook(FilterMultiSportRequest request, bool isLeader)
    {
        var data = await FetchMatchesAndResultDetails(request);
        var matches = await GetMoreScore(data, isLeader);
        var matchesSorted = matchService.SortingMatches(matches);
        return GroupSport(matchesSorted);
    }

    private async Task<(List<ResourceTicketStatistic>, Dictionary<long, List<MatchTicketStatistic>>)> GetOSTicketInfo(MatchFilterTuple matchTuple, SportsbookCriteria filterCriteria)
    {
        var matchesInfo = matchTuple.Matches.Select(x => new MatchRequest
        {
            MatchId = x.MatchId,
            ChildMatchType = x.ChildMatchType,
            EventStatus = x.EventStatus,
            SportType = x.SportType,
            ConfirmFT = x.ConfirmFT,
            ConfirmHT = x.ConfirmHT,
            ParentId = x.ParentId
        });

        var matchesOverStatus = matchTuple.MatchOverStatuses;
        var parentChildMatchFilters = matchTuple.ParentChildMatchFilters;

        var criteria = new OSTicketInfoSelCriteria
        {
            MatchInfo = JsonSerializer.Serialize(matchesInfo),
            ChildMatchInfo = parentChildMatchFilters.Count == 0 ? string.Empty : JsonSerializer.Serialize(parentChildMatchFilters),
            OverStatus = filterCriteria.OverStatus,
            MatchCode = filterCriteria.MatchCode
        };

        return await GetTicketInfoAllDbSites(criteria);
    }


    private async Task<(List<ResourceTicketStatistic>, Dictionary<long, List<MatchTicketStatistic>>)> GetTicketInfoAllDbSites(OSTicketInfoSelCriteria criteria)
    {
        var siteDbServer = appSettingsKey.Value.SiteDbServer;
        var getTicketInfoTasks = siteDbServer.Select(s => GetTicketInfo(s, criteria));

        var results = await Task.WhenAll(getTicketInfoTasks);


        var x = results.SelectMany(t => t.Item1).ToList();
        var resourceGroupedMatches = results
            .SelectMany(t => t.Item1)
            .GroupBy(x => new
            {
                x.MatchId,
                x.ResourceId
            })
            .ToDictionary(x => x.Key, x => x.ToList());

        var groupedMatches = results
            .SelectMany(t => t.Item2)
            .GroupBy(x => x.MatchId)
            .ToDictionary(x => x.Key, x => x.ToList());


        return (x, groupedMatches);
    }

    private async Task<(IEnumerable<ResourceTicketStatistic>, IEnumerable<MatchTicketStatistic>)> GetTicketInfo(string server, OSTicketInfoSelCriteria criteria)
    {
        criteria.DbServer = server;

        return await repository.FetchMultipleAsync<ResourceTicketStatistic, MatchTicketStatistic>(criteria);
    }

    private async Task<MatchFilterTuple> GetMatches(SportsbookCriteria criteria)
    {
        var result = await repository.FetchMultipleAsync<Match, MatchOverStatus, ParentChildMatchFilter>(criteria);

        return (result.Item1.ToList(), result.Item2.ToList(), result.Item3.ToList());
    }

    private async Task<List<Match>> GetMatchesAllInfo(SportsbookCriteria criteria)
    {
        var matchTuple = await GetMatches(criteria);
        var (x, matchTicketStatistics) = (await GetOSTicketInfo(matchTuple, criteria));

        var matches = matchTuple.Matches.ToList();


        SetMatchTicketInfo(matches, matchTicketStatistics);

        return matches;
    }

    private void SetMatchTicketInfo(List<Match> matches, Dictionary<long, List<MatchTicketStatistic>> siteMatches)
    {
        foreach (var match in matches)
        {
            var isExistTicket = siteMatches.TryGetValue(match.MatchId, out var matchTicketStatistics);
            if (!isExistTicket)
            {
                continue;
            }

            match.SuspenderFullTime = matchTicketStatistics.Find(x => !string.IsNullOrEmpty(x.SuspenderFullTime))?.SuspenderFullTime;
            match.SuspenderHalfTime = matchTicketStatistics.Find(x => !string.IsNullOrEmpty(x.SuspenderHalfTime))?.SuspenderHalfTime;

            match.IsExistEarlyBetTypes = matchTicketStatistics.Exists(x => x.IsExistEarlyBetTypes);
            match.IsRunningEarlyBetTypes = matchTicketStatistics.Exists(x => x.IsRunningEarlyBetTypes);
            match.IsWaitingEarlyBetTypes = matchTicketStatistics.Exists(x => x.IsWaitingEarlyBetTypes);
            match.IsExistRunningTicket = matchTicketStatistics.Exists(x => x.IsExistRunningTicket);
            match.IsExistMarkedTicket = matchTicketStatistics.Exists(x => x.IsExistMarkedTicket);
            //match.IsExistsConfirmedEarly = ticketInfo.Exists(x => x.IsExistsConfirmedEarly);

            match.IsCalculatingSingle = siteMatchService.IsCalculating([.. matchTicketStatistics.Select(x => x.IsCalculatingSingle)]);
            match.IsCalculatingMP = siteMatchService.IsCalculating([.. matchTicketStatistics.Select(x => x.IsCalculatingMP)]);
        }
    }

    private async Task<List<Match>> GetMoreScore(MultiSportResult data, bool isLeader)
    {
        var matchesByEachSport = data.Matches
            .GroupBy(match => match.SportType)
            .Select(sports => new MatchesBySportTypeModel
            {
                SportType = sports.Key,
                Matches = sports.ToList()
            })
            .ToList();

        var tasks = matchesByEachSport.Select(sportGroup =>
        {
            sportGroup.Matches = matchService.GetScoreForMatchBySportType(
                sportGroup.Matches,
                data.ResultDetails,
                sportGroup.SportType,
                isLeader);

            return Task.FromResult(sportGroup.Matches);
        });

        var results = await Task.WhenAll(tasks);
        return results.SelectMany(matches => matches).ToList();

    }

    private static List<SportModel> GroupSport(List<Match> matches)
    {
        return matches.GroupBy(match => new { match.SportName, match.SportType })
                                .OrderByDescending(sport => SportSortingOrder.IndexOf(sport.Key.SportType))
                                .ThenBy(sport => sport.Key.SportType == SportType.OtherSports)
                                .ThenBy(sport => sport.Key.SportName)
                                .Select(sports => new SportModel
                                {
                                    Id = sports.Key.SportType,
                                    Name = sports.Key.SportName,
                                    Leagues = GroupLeague(sports)
                                }).ToList();
    }

    private static List<LeagueModel> GroupLeague(IEnumerable<Match> matches)
    {
        var currentLeague = 0;
        var leagues = new List<LeagueModel>();
        var league = new LeagueModel();
        foreach (var match in matches)
        {
            if (currentLeague == match.LeagueId)
            {
                league.Matches.Add(match);
            }
            else
            {
                league = CreateNewLeague(match);
                currentLeague = match.LeagueId;
                league.Matches.Add(match);
                leagues.Add(league);
            }
        }

        return leagues;
    }

    private static LeagueModel CreateNewLeague(Match match)
    {
        return new LeagueModel
        {
            Name = match.LeagueName,
            LeagueId = match.LeagueId,
            AutoWaitingTime = match.AutoWaitingTime,
            AutoMainWaitingTime = match.AutoMainWaitingTime,
            AutoEarlyWaitingTime = match.AutoEarlyWaitingTime,
            AutoRetryTime = match.AutoRetryTime,
            AutoCalcSetting = match.AutoCalcSetting,
            Matches = [],
            RefundWaitingTime = match.RefundWaitingTime,
            SportType = match.SportType
        };
    }

    private async Task<MultiSportResult> FetchMatchesAndResultDetails(FilterMultiSportRequest request)
    {
        var criteria = mapper.Map<FilterMultiSportRequest, SportsbookCriteria>(request);

        var matches = await GetMatchesAllInfo(criteria);

        var resultDetails = await ResultDetailByMatchIds(matches);

        matches = await matchService.SetNewOsMatchInfo(matches, resultDetails);

        return new MultiSportResult
        {
            Matches = matches,
            ResultDetails = resultDetails
        };
    }

    private async Task<List<ResultDetail>> ResultDetailByMatchIds(List<Match> matches)
    {
        var matchIdBatches = matches
            .DistinctBy(m => m.MatchId)
            .Select(match => match.MatchId.ToString())
            .Chunk(PARALLEL_BATCH_SIZE);

        var tasks = matchIdBatches.Select(batch =>
        {
            var criteria = new GetResultDetailCriteria
            {
                MatchIdList = string.Join(",", batch)
            };
            return repository.FetchAsync<ResultDetail>(criteria);
        });

        var results = await Task.WhenAll(tasks);
        return results.SelectMany(x => x).ToList();
    }
}