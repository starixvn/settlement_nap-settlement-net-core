using Fanex.Caching;
using Settlement.Core.Constants;
using Settlement.ThirdPartyProducts.Models;
using System;
using System.Collections.Generic;

namespace Settlement.ThirdPartyProducts.Services
{
    public interface CachingMatchesService
    {
        List<MatchDetailModel> MatchesOnShortCaching(string leagueIds);

        List<MatchDetailModel> MatchesOnLongCaching(string leagueIds);

        public void SetToCache(string leagueIds, List<MatchDetailModel> matches);
    }

    public class CachingMatchesServiceImp : CachingMatchesService
    {
        private readonly ICacheService cacheService;

        public CachingMatchesServiceImp(ICacheService cacheService)
        {
            this.cacheService = cacheService;
        }

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
            const int shortCacheExpirationTime = 3;
            const int longCacheExpirationTime = 20;
            cacheService.SetAsync(shortCachingKey, matches, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromSeconds(shortCacheExpirationTime)));
            cacheService.SetAsync(longCachingKey, matches, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(longCacheExpirationTime)));
        }

        private static string ShortCachingKey(string leagueIds) => $"{CacheServiceKey.WaitingBetBuilderCacheKey}-{leagueIds}";

        private static string LongCachingKey(string leagueIds) => $"{ShortCachingKey(leagueIds)}-longCaching";
    }
}