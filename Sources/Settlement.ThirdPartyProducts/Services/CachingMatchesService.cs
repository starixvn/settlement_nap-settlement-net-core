using Microsoft.Extensions.Caching.Memory;
using Settlement.Constants;
using Settlement.ThirdPartyProducts.Models;

namespace Settlement.ThirdPartyProducts.Services;

public interface CachingMatchesService
{
    List<MatchDetailModel> MatchesOnShortCaching(string leagueIds);

    List<MatchDetailModel> MatchesOnLongCaching(string leagueIds);

    void SetToCache(string leagueIds, List<MatchDetailModel> matches);
}

public class CachingMatchesServiceImp(IMemoryCache cacheService) : CachingMatchesService
{
    public List<MatchDetailModel> MatchesOnShortCaching(string leagueIds)
    {
        var shortCachingKey = ShortCachingKey(leagueIds);
        return cacheService.Get<List<MatchDetailModel>>(shortCachingKey);
    }

    public List<MatchDetailModel> MatchesOnLongCaching(string leagueIds)
    {
        var longCachingKey = LongCachingKey(leagueIds);

        return cacheService.Get<List<MatchDetailModel>>(longCachingKey);
    }

    public void SetToCache(string leagueIds, List<MatchDetailModel> matches)
    {
        var shortCachingKey = ShortCachingKey(leagueIds);
        var longCachingKey = LongCachingKey(leagueIds);

        cacheService.Set(shortCachingKey, matches, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromSeconds(CacheSettings.Expiration.ShortCallRefreshTimerSeconds)));
        cacheService.Set(longCachingKey, matches, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheSettings.Expiration.LongCallRefreshTimerMinutes)));
    }

    private static string ShortCachingKey(string leagueIds) => $"{CacheSettings.Keys.WaitingBetBuilderCacheKey}-{leagueIds}";

    private static string LongCachingKey(string leagueIds) => $"{ShortCachingKey(leagueIds)}-long";
}