namespace Settlement.EventManagement.Services.Calculation;

using Criteria;
using Fanex.Caching;
using Settlement.EventManagement.Models.Calculation;

public interface CachingMatchesService
{
    List<CalculateMatchWaiting> SetToCache(List<Match> matches, string hashLeagueIds, bool autoCalculate = false);

    Task<List<CalculateMatchWaiting>> GetShortCache(string hashLeagueIds, bool autoCalculate = false);

    Task<List<CalculateMatchWaiting>> GetLongCache(string hashLeagueIds, bool autoCalculate = false);

    Task<Dictionary<int, List<ReferenceAction>>> GetReferenceActions(IEnumerable<int> matchIds);
}

public class CachingMatchesServiceImp : CachingMatchesService
{
    private readonly ICacheService cacheService;

    private readonly IDynamicRepository repository;

    private readonly IMapper mapper;

    public CachingMatchesServiceImp(ICacheService cacheService,
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
        const int shortCacheExpirationTime = 3;
        const int longCacheExpirationTime = 20;
        var waitingMatch = mapper.Map<List<CalculateMatchWaiting>>(matches);
        cacheService.Set(shortCachingKey, waitingMatch, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromSeconds(shortCacheExpirationTime)));
        cacheService.SetAsync(longCachingKey, waitingMatch, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(longCacheExpirationTime)));

        return waitingMatch;
    }

    private static string ShortCachingKey(string hashLeagueIds, bool autoCalculate) => autoCalculate ? $"{CacheServiceKey.WaitingAutoPayoutCacheKey}-{hashLeagueIds}"
                                                                                            : $"{CacheServiceKey.WaitingListCacheKey}-{hashLeagueIds}";

    private static string LongCachingKey(string hashLeagueIds, bool autoCalculate) => $"{ShortCachingKey(hashLeagueIds, autoCalculate)}-long";

    public async Task<List<CalculateMatchWaiting>> GetShortCache(string hashLeagueIds, bool autoCalculate = false)
    {
        var shortCachingKey = ShortCachingKey(hashLeagueIds, autoCalculate);

        var (_, test) = await cacheService.TryGetAsync<List<Match>>(shortCachingKey);
        if (test != null)
        {
            var value = test;
        }

        return await cacheService.GetAsync<List<CalculateMatchWaiting>>(ShortCachingKey(hashLeagueIds, autoCalculate));
    }

    public async Task<List<CalculateMatchWaiting>> GetLongCache(string hashLeagueIds, bool autoCalculate = false)
    {
        var shortCachingKey = LongCachingKey(hashLeagueIds, autoCalculate);

        var (_, test) = await cacheService.TryGetAsync<List<Match>>(shortCachingKey);
        if (test != null)
        {
            var value = test;
        }

        return await cacheService.GetAsync<List<CalculateMatchWaiting>>(LongCachingKey(hashLeagueIds, autoCalculate)) ?? new List<CalculateMatchWaiting>();
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