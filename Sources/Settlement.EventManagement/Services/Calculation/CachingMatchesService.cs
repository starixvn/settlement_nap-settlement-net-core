namespace Settlement.EventManagement.Services.Calculation;

using Criteria;
using Microsoft.Extensions.Caching.Memory;
using Settlement.EventManagement.Models.Calculation;

public interface CachingMatchesService
{
    List<CalculateMatchWaiting> SetToCache(List<Match> matches, string hashLeagueIds, bool autoCalculate = false);

    List<CalculateMatchWaiting> GetShortCache(string hashLeagueIds, bool autoCalculate = false);

    List<CalculateMatchWaiting> GetLongCache(string hashLeagueIds, bool autoCalculate = false);

    Task<Dictionary<int, List<ReferenceAction>>> GetReferenceActions(IEnumerable<int> matchIds);
}

public class CachingMatchesServiceImp : CachingMatchesService
{
    private readonly IMemoryCache cacheService;

    private readonly IDynamicRepository repository;

    private readonly IMapper mapper;

    public CachingMatchesServiceImp(IMemoryCache cacheService,
        IDynamicRepository repository,
        IMapper mapper)
    {
        this.cacheService = cacheService;
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<CalculateMatchWaiting> SetToCache(List<Match> matches, string hashLeagueIds, bool autoCalculate = false)
    {
        var shortCachingKey = ShortCachingKey(hashLeagueIds, autoCalculate);
        var longCachingKey = LongCachingKey(hashLeagueIds, autoCalculate);
        var waitingMatch = mapper.Map<List<CalculateMatchWaiting>>(matches);

        cacheService.Set(shortCachingKey, waitingMatch, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromSeconds(CacheSettings.Expiration.ShortCallRefreshTimerSeconds)));
        cacheService.Set(longCachingKey, waitingMatch, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheSettings.Expiration.LongCallRefreshTimerMinutes)));
        return waitingMatch;
    }

    private static string ShortCachingKey(string hashLeagueIds, bool autoCalculate) => autoCalculate ? $"{CacheSettings.Keys.WaitingAutoPayoutCacheKey}-{hashLeagueIds}"
                                                                                            : $"{CacheSettings.Keys.WaitingListCacheKey}-{hashLeagueIds}";

    private static string LongCachingKey(string hashLeagueIds, bool autoCalculate) => $"{ShortCachingKey(hashLeagueIds, autoCalculate)}-long";

    public List<CalculateMatchWaiting> GetShortCache(string hashLeagueIds, bool autoCalculate = false)
    {
        var shortCachingKey = ShortCachingKey(hashLeagueIds, autoCalculate);
        return cacheService.Get<List<CalculateMatchWaiting>>(shortCachingKey);
    }

    public List<CalculateMatchWaiting> GetLongCache(string hashLeagueIds, bool autoCalculate = false)
    {
        var longCachingKey = LongCachingKey(hashLeagueIds, autoCalculate);
        return cacheService.Get<List<CalculateMatchWaiting>>(longCachingKey);
    }

    public async Task<Dictionary<int, List<ReferenceAction>>> GetReferenceActions(IEnumerable<int> matchIds)
    {
        var matchIdsAsString = string.Join(",", matchIds);
        if (string.IsNullOrWhiteSpace(matchIdsAsString))
        {
            return new Dictionary<int, List<ReferenceAction>>();
        }

        var criteria = new GetReferenceActionCriteria { MatchIds = matchIdsAsString };

        var rawReferenceActions = await repository.FetchAsync<ReferenceAction>(criteria);

        return rawReferenceActions.GroupBy(t => t.MatchId)
            .ToDictionary(g => g.Key, g => g.ToList());
    }
}