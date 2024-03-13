using System.Security.Cryptography;

namespace Settlement.EventManagement.Services.MultiSports;

using Criteria;
using Microsoft.Extensions.Caching.Memory;
using Requests;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.EventManagement.Models.MultiSports;
using System.Text;
using Match = Models.MultiSports.Match;

public interface IMultiSportService
{
    Task<List<SportModel>> GetSportBook(FilterMultiSportRequest request, bool isLeader);

    Task<List<MultiSportMatchWaiting>> GetWaitingMatches(RefreshMultiSportRequest request, bool isLeader);
}

public class MultiSportServiceImp(
    IDynamicRepository repository,
    IMatchService matchService,
    IMapper mapper,
    IMemoryCache cacheService,
    IOptions<AppSettingsKey> appSettingsKey)
    : IMultiSportService
{
    private static int _isProcessing;

    public async Task<List<SportModel>> GetSportBook(FilterMultiSportRequest request, bool isLeader)
    {
        var data = await FetchMatchesAndResultDetails(request);
        var matches = GetMoreScore(data, isLeader);

        var matchesSorted = matchService.SortingMatches(matches);

        var sportBooks = GroupSport(matchesSorted);
        return sportBooks;
    }

    public async Task<List<MultiSportMatchWaiting>> GetWaitingMatches(RefreshMultiSportRequest request, bool isLeader)
    {
        var hashLeagueIds = ConvertKeyToHash(request.LeagueIds);
        var matches = MatchesOnShortCaching(hashLeagueIds);

        if (matches is { Count: > 0 })
        {
            return matches;
        }

        if (0 == Interlocked.Exchange(ref _isProcessing, 1))
        {
            try
            {
                return await GetAndCachingMatches(request, hashLeagueIds, isLeader);
            }
            finally
            {
                Interlocked.Exchange(ref _isProcessing, 0);
            }
        }

        return MatchesOnLongCaching(hashLeagueIds);
    }

    private static string ConvertKeyToHash(string input)
    {
        var data = SHA1.HashData(Encoding.Unicode.GetBytes(input));
        return Convert.ToHexString(data).ToLowerInvariant();
    }

    private List<MultiSportMatchWaiting> MatchesOnShortCaching(string hashLeagueIds)
    {
        var shortCachingKey = ShortCachingKey(hashLeagueIds);
        return cacheService.Get<List<MultiSportMatchWaiting>>(shortCachingKey);
    }

    private List<MultiSportMatchWaiting> MatchesOnLongCaching(string hashLeagueIds)
    {
        var longCachingKey = LongCachingKey(hashLeagueIds);
        return cacheService.Get<List<MultiSportMatchWaiting>>(longCachingKey);
    }

    private static string ShortCachingKey(string hashLeagueIds) => $"{CacheSettings.Keys.MemoryCacheMultiSportCacheKey}-{hashLeagueIds}";

    private static string LongCachingKey(string hashLeagueIds) => $"{ShortCachingKey(hashLeagueIds)}-long";

    private async Task<List<MultiSportMatchWaiting>> GetAndCachingMatches(RefreshMultiSportRequest request, string hashLeagueIds, bool isLeader)
    {
        var criteria = mapper.Map<RefreshMultiSportRequest, GetWaitingMultiSportCriteria>(request);
        var waitingMatches = await GetMatchesAllSites(criteria);
        var listResultDetail = await ResultDetailByMatchIds(waitingMatches);

        waitingMatches = await matchService.SetNewMatchInfo(waitingMatches, listResultDetail);

        var matches = GetMoreScore(new MultiSportResult { Matches = waitingMatches, ResultDetails = listResultDetail }, isLeader);

        return SetToCache(hashLeagueIds, matches);
    }

    private async Task<List<Match>> GetMatchesAllSites(MultipleSiteCriteria criteria)
    {
        var siteDbServer = appSettingsKey.Value.SiteDbServer;
        var fetchMatchTasks = siteDbServer.Select(s => FetchMatches(s, criteria)).ToList();
        var listMatch = await Task.WhenAll(fetchMatchTasks.ToArray());

        var matchesInAllServers = listMatch.Select(m => m.ToList()).ToList();

        var baseMatches = matchesInAllServers.SelectMany(m => m).Distinct().ToList();

        for (var i = 1; i < siteDbServer.Count; i++)
        {
            matchService.AddSiteInfo(baseMatches, matchesInAllServers[i]);
        }

        return baseMatches;
    }

    private async Task<IEnumerable<Match>> FetchMatches(string server, MultipleSiteCriteria criteria)
    {
        criteria.DbServer = server;
        return await repository.FetchAsync<Match>(criteria);
    }

    private List<MultiSportMatchWaiting> SetToCache(string hashLeagueIds, List<Match> matches)
    {
        var shortCachingKey = ShortCachingKey(hashLeagueIds);
        var longCachingKey = LongCachingKey(hashLeagueIds);
        var waitingMatches = mapper.Map<List<MultiSportMatchWaiting>>(matches);

        cacheService.Set(shortCachingKey, waitingMatches, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromSeconds(CacheSettings.Expiration.ShortCallRefreshTimerSeconds)));
        cacheService.Set(longCachingKey, waitingMatches, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheSettings.Expiration.LongCallRefreshTimerMinutes)));

        return waitingMatches;
    }

    private List<Match> GetMoreScore(MultiSportResult data, bool isLeader)
    {
        var matchesByEachSport = data.Matches.GroupBy(match => match.SportType)
            .Select(sports => new MatchesBySportTypeModel { SportType = sports.Key, Matches = sports.ToList() })
            .ToList();

        var listMatch = new List<Match>();
        foreach (var item in matchesByEachSport)
        {
            item.Matches = matchService.GetScoreForMatchBySportType(item.Matches, data.ResultDetails, item.SportType, isLeader);
            listMatch.AddRange(item.Matches);
        }

        return listMatch;
    }

    private static List<SportModel> GroupSport(List<Match> matches)
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
                    AutoRetryTime = match.AutoRetryTime,
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
        matches = await matchService.SetNewMatchInfo(matches, resultDetails);

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