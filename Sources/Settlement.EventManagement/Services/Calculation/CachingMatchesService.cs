namespace Settlement.EventManagement.Services.Calculation;

using Criteria;
using Fanex.Caching;
using Settlement.EventManagement.Models.Calculation;

public interface CachingMatchesService
{
    void SetToCache(List<Match> matches, string hashLeagueIds, bool autoCalculate = false);

    Task<List<Match>> GetShortCache(string hashLeagueIds, bool autoCalculate = false);

    Task<List<Match>> GetLongCache(string hashLeagueIds, bool autoCalculate = false);

    Task<Dictionary<int, List<ReferenceAction>>> GetReferenceActions(IEnumerable<int> matchIds);
}

public class CachingMatchesServiceImp : CachingMatchesService
{
    private readonly ICacheService cacheService;

    private readonly IDynamicRepository repository;

    public CachingMatchesServiceImp(ICacheService cacheService,
        IDynamicRepository repository)
    {
        this.cacheService = cacheService;
        this.repository = repository;
    }

    public void SetToCache(List<Match> matches, string hashLeagueIds, bool autoCalculate = false)
    {
        var shortCachingKey = ShortCachingKey(hashLeagueIds, autoCalculate);
        var longCachingKey = LongCachingKey(hashLeagueIds, autoCalculate);
        const int shortCacheExpirationTime = 3;
        const int longCacheExpirationTime = 20;

        cacheService.Set(shortCachingKey, matches, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromSeconds(shortCacheExpirationTime)));
        cacheService.SetAsync(longCachingKey, matches, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(longCacheExpirationTime)));
    }

    private static string ShortCachingKey(string hashLeagueIds, bool autoCalculate) => autoCalculate ? $"{CacheServiceKey.WaitingAutoPayoutCacheKey}-{hashLeagueIds}"
                                                                                            : $"{CacheServiceKey.WaitingListCacheKey}-{hashLeagueIds}";

    private static string LongCachingKey(string hashLeagueIds, bool autoCalculate) => $"{ShortCachingKey(hashLeagueIds, autoCalculate)}-long";

    public async Task<List<Match>> GetShortCache(string hashLeagueIds, bool autoCalculate = false)
    {
        var shortCachingKey = ShortCachingKey(hashLeagueIds, autoCalculate);

        var (_, test) = await cacheService.TryGetAsync<List<Match>>(shortCachingKey);
        if (test != null)
        {
            var value = test;
        }

        return await cacheService.GetAsync<List<Match>>(ShortCachingKey(hashLeagueIds, autoCalculate));
    }

    public async Task<List<Match>> GetLongCache(string hashLeagueIds, bool autoCalculate = false)
    {
        var shortCachingKey = LongCachingKey(hashLeagueIds, autoCalculate);

        var (_, test) = await cacheService.TryGetAsync<List<Match>>(shortCachingKey);
        if (test != null)
        {
            var value = test;
        }

        return await cacheService.GetAsync<List<Match>>(LongCachingKey(hashLeagueIds, autoCalculate)) ?? new List<Match>();
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