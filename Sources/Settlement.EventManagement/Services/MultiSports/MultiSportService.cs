namespace Settlement.EventManagement.Services.MultiSports;

using Criteria;
using Requests;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Models.MultiSports;
using Match = Models.MultiSports.Match;

public interface IMultiSportService
{
    Task<List<SportModel>> GetSportBook(FilterMultiSportRequest request);

    Task<List<Match>> GetWaitingMatches(RefreshMultiSportRequest request);
}

public class MultiSportServiceImp : IMultiSportService
{
    private static int _isProcessing;
    private readonly IDynamicRepository repository;
    private readonly IMatchService matchService;
    private readonly IMapper mapper;
    private readonly ICacheService cacheService;
    private readonly PermissionService permissionService;
    private readonly AppSettingsKey appSettingsKey;

    public MultiSportServiceImp(
        IDynamicRepository repository,
        IMatchService matchService,
        IMapper mapper,
        ICacheService cacheService,
        PermissionService permissionService,
        IOptions<AppSettingsKey> appSettingsKey)
    {
        this.repository = repository;
        this.matchService = matchService;
        this.permissionService = permissionService;
        this.cacheService = cacheService;
        this.mapper = mapper;
        this.appSettingsKey = appSettingsKey.Value;
    }

    public async Task<List<SportModel>> GetSportBook(FilterMultiSportRequest request)
    {
        var data = await FetchMatchesAndResultDetails(request);
        var matches = GetMoreScore(data);

        var matchesSorted = matchService.SortingMatches(matches);

        var sportBooks = GroupSport(matchesSorted);
        return sportBooks;
    }

    public async Task<List<Match>> GetWaitingMatches(RefreshMultiSportRequest request)
    {
        var matches = MatchesOnShortCaching(request.LeagueIds);

        if (matches is { Count: > 0 })
        {
            return matches;
        }

        if (0 == Interlocked.Exchange(ref _isProcessing, 1))
        {
            try
            {
                return await GetAndCachingMatches(request);
            }
            finally
            {
                Interlocked.Exchange(ref _isProcessing, 0);
            }
        }

        return MatchesOnLongCaching(request.LeagueIds);
    }

    private List<Match> MatchesOnShortCaching(string leagueIds)
    {
        var shortCachingKey = ShortCachingKey(leagueIds);
        return cacheService.Get<List<Match>>(shortCachingKey);
    }

    private List<Match> MatchesOnLongCaching(string leagueIds)
    {
        var longCachingKey = LongCachingKey(leagueIds);
        return cacheService.Get<List<Match>>(longCachingKey);
    }

    private static string ShortCachingKey(string leagueIds) => $"{CacheServiceKey.MemoryCacheMultiSportCacheKey}-{leagueIds}";

    private static string LongCachingKey(string leagueIds) => $"{ShortCachingKey(leagueIds)}-longCaching";

    private async Task<List<Match>> GetAndCachingMatches(RefreshMultiSportRequest request)
    {
        var criteria = mapper.Map<RefreshMultiSportRequest, GetWaitingMultiSportCriteria>(request);
        var waitingMatches = await GetMatchesAllSites(criteria);
        var listResultDetail = await ResultDetailByMatchIds(waitingMatches);

        waitingMatches = matchService.SetNewMatchInfo(waitingMatches, listResultDetail);

        var matches = GetMoreScore(new MultiSportResult { Matches = waitingMatches, ResultDetails = listResultDetail });

        SetToCache(request.LeagueIds, matches);

        return matches;
    }

    private async Task<List<Match>> GetMatchesAllSites(MultipleSiteCriteria criteria)
    {
        var fetchMatchTasks = appSettingsKey
            .SiteDbServer
            .Select(s => FetchMatches(s, criteria))
            .ToList();
        var listMatch = await Task.WhenAll(fetchMatchTasks.ToArray());

        var matchesInAllServers = listMatch.Select(m => m.ToList()).ToList();

        var baseMatches = matchesInAllServers.SelectMany(m => m).Distinct().ToList();

        for (var i = 1; i < appSettingsKey.SiteDbServer.Count; i++)
        {
            matchService.AddSiteInfo(baseMatches, matchesInAllServers[i]);
        }

        return baseMatches;
    }

    private Task<IEnumerable<Match>> FetchMatches(string server, MultipleSiteCriteria criteria)
    {
        criteria.DbServer = server;
        return repository.FetchAsync<Match>(criteria);
    }

    private void SetToCache(string leagueIds, List<Match> matches)
    {
        var shortCachingKey = ShortCachingKey(leagueIds);
        var longCachingKey = LongCachingKey(leagueIds);
        const int shortCacheExpirationTime = 3;
        const int longCacheExpirationTime = 20;
        cacheService.SetAsync(shortCachingKey, matches, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromSeconds(shortCacheExpirationTime)));
        cacheService.SetAsync(longCachingKey, matches, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(longCacheExpirationTime)));
    }

    private List<Match> GetMoreScore(MultiSportResult data)
    {
        var matchesByEachSport = data.Matches.GroupBy(match => match.SportType)
            .Select(sports => new MatchesBySportTypeModel { SportType = sports.Key, Matches = sports.ToList() })
            .ToList();
        var permission = permissionService.GetPermission(CacheServiceKey.MemoryCacheManualPermission);
        var listMatch = new List<Match>();
        foreach (var item in matchesByEachSport)
        {
            item.Matches = matchService.GetScoreForMatchBySportType(item.Matches, data.ResultDetails, item.SportType, permission);
            listMatch.AddRange(item.Matches);
        }

        return listMatch;
    }

    private List<SportModel> GroupSport(List<Match> matches)
    {
        var sportSorting = new List<int>
            {
                SportType.Tennis,
                SportType.ESports,
                SportType.BasketBall,
                SportType.Badminton
            };

        var sportBook = matches.GroupBy(match => new { match.SportName, match.SportType })
                                .OrderByDescending(sport => sportSorting.IndexOf(sport.Key.SportType))
                                .ThenBy(sport => sport.Key.SportType == SportType.OtherSports)
                                .ThenBy(sport => sport.Key.SportName)
                                .Select(sports => new SportModel
                                {
                                    Id = sports.Key.SportType,
                                    Name = sports.Key.SportName,
                                    Leagues = GroupLeague(sports)
                                }).ToList();
        return sportBook;
    }

    private static List<LeagueModel> GroupLeague(IEnumerable<Match> matches)
    {
        var currentLeague = 0;
        var leagues = new List<LeagueModel>();
        var league = new LeagueModel();
        foreach (var match in matches)
        {
            if (currentLeague.Equals(match.LeagueId))
            {
                league.Matches.Add(match);
            }
            else
            {
                league = new LeagueModel
                {
                    Name = match.LeagueName,
                    LeagueId = match.LeagueId,
                    AutoWaitingTime = match.AutoWaitingTime,
                    AutoCalcSetting = match.AutoCalcSetting,
                    Matches = new List<Match>(),
                    SportType = match.SportType
                };

                currentLeague = match.LeagueId;
                league.Matches.Add(match);
                leagues.Add(league);
            }
        }

        return leagues.ToList();
    }

    private async Task<MultiSportResult> FetchMatchesAndResultDetails(FilterMultiSportRequest request)
    {
        var criteria = mapper.Map<FilterMultiSportRequest, SportsbookCriteria>(request);
        var matches = await GetMatchesAllSites(criteria);
        var resultDetails = await ResultDetailByMatchIds(matches);
        matches = matchService.SetNewMatchInfo(matches, resultDetails);

        return new MultiSportResult
        {
            Matches = matches,
            ResultDetails = resultDetails
        };
    }

    private async Task<List<ResultDetail>> ResultDetailByMatchIds(List<Match> matches)
    {
        var listMatchId = string.Join(",", matches.Select(match => match.MatchId.ToString()).ToArray());
        var resultDetailCriteria = new GetResultDetailCriteria { MatchIdList = listMatchId };
        return (await repository.FetchAsync<ResultDetail>(resultDetailCriteria)).ToList();
    }
}