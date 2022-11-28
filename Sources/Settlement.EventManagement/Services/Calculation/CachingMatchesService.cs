using Settlement.EventManagement.Criteria;
using Settlement.EventManagement.Models.Calculation;

namespace Settlement.EventManagement.Services.Calculation;

public interface CachingMatchesService
{
    void SetToCache(List<Match> matches, string leagueIds, bool autoCalculate = false);

    Task<List<Match>> GetShortCache(string leagueIds, bool autoCalculate = false);

    Task<List<Match>> GetLongCache(string leagueIds, bool autoCalculate = false);

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

    public void SetToCache(List<Match> matches, string leagueIds, bool autoCalculate = false)
    {
        var shortCachingKey = ShortCachingKey(leagueIds, autoCalculate);
        var longCachingKey = LongCachingKey(leagueIds, autoCalculate);
        const int shortCacheExpirationTime = 3;
        const int longCacheExpirationTime = 20;
        cacheService.SetAsync(shortCachingKey, matches, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromSeconds(shortCacheExpirationTime)));
        cacheService.SetAsync(longCachingKey, matches, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(longCacheExpirationTime)));
    }

    private static string ShortCachingKey(string leagueIds, bool autoCalculate) => autoCalculate ? $"{CacheServiceKey.WaitingAutoPayoutCacheKey}-{leagueIds}"
                                                                                            : $"{CacheServiceKey.WaitingListCacheKey}-{leagueIds}";

    private static string LongCachingKey(string leagueIds, bool autoCalculate) => $"{ShortCachingKey(leagueIds, autoCalculate)}-longCaching";

    public async Task<List<Match>> GetShortCache(string leagueIds, bool autoCalculate = false)
    {
        return await cacheService.GetAsync<List<Match>>(ShortCachingKey(leagueIds, autoCalculate));
    }

    public async Task<List<Match>> GetLongCache(string leagueIds, bool autoCalculate = false)
    {
        return await cacheService.GetAsync<List<Match>>(LongCachingKey(leagueIds, autoCalculate)) ?? new List<Match>();
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