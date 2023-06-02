using Fanex.Caching;
using Settlement.Core.Constants;
using Settlement.ThirdPartyProducts.Models;

namespace Settlement.ThirdPartyProducts.Services;

public interface CachingMatchesService
{
    Task<List<MatchDetailModel>> MatchesOnShortCaching(string leagueIds);

    Task<List<MatchDetailModel>> MatchesOnLongCaching(string leagueIds);

    Task SetToCache(string leagueIds, List<MatchDetailModel> matches);
}

public class CachingMatchesServiceImp : CachingMatchesService
{
    private readonly ICacheService cacheService;

    public CachingMatchesServiceImp(ICacheService cacheService)
    {
        this.cacheService = cacheService;
    }

    public async Task<List<MatchDetailModel>> MatchesOnShortCaching(string leagueIds)
    {
        var shortCachingKey = ShortCachingKey(leagueIds);
        return await cacheService.GetAsync<List<MatchDetailModel>>(shortCachingKey);
    }

    public async Task<List<MatchDetailModel>> MatchesOnLongCaching(string leagueIds)
    {
        var longCachingKey = LongCachingKey(leagueIds);

        return await cacheService.GetAsync<List<MatchDetailModel>>(longCachingKey);
    }

    public async Task SetToCache(string leagueIds, List<MatchDetailModel> matches)
    {
        var shortCachingKey = ShortCachingKey(leagueIds);
        var longCachingKey = LongCachingKey(leagueIds);

        await cacheService.SetAsync(shortCachingKey, matches, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromSeconds(CacheSettings.Expiration.ShortCallRefreshTimerSeconds)));
        await cacheService.SetAsync(longCachingKey, matches, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheSettings.Expiration.LongCallRefreshTimerMinutes)));
    }

    private static string ShortCachingKey(string leagueIds) => $"{CacheSettings.Keys.WaitingBetBuilderCacheKey}-{leagueIds}";

    private static string LongCachingKey(string leagueIds) => $"{ShortCachingKey(leagueIds)}-long";
}