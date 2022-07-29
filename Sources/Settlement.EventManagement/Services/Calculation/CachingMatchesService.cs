using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fanex.Caching;
using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.EventManagement.Criteria;
using Settlement.EventManagement.Models.Calculation;

namespace Settlement.EventManagement.Services.Calculation
{
    public interface CachingMatchesService
    {
        void SetToCache(List<Match> matches, int leagueId);

        Task<List<Match>> GetShortCache(int leagueId);

        Task<List<Match>> GetLongCache(int leagueId);

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

        public void SetToCache(List<Match> matches, int leagueId)
        {
            var shortCachingKey = ShortCachingKey(leagueId);
            var longCachingKey = LongCachingKey(leagueId);
            const int shortCacheExpirationTime = 3;
            const int longCacheExpirationTime = 20;
            cacheService.SetAsync(shortCachingKey, matches, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromSeconds(shortCacheExpirationTime)));
            cacheService.SetAsync(longCachingKey, matches, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(longCacheExpirationTime)));
        }

        private static string ShortCachingKey(int leagueId) => $"{CacheServiceKey.WaitingListCacheKey}-{leagueId}";

        private static string LongCachingKey(int leagueId) => $"{ShortCachingKey(leagueId)}-longCaching";

        public async Task<List<Match>> GetShortCache(int leagueId)
        {
            return await cacheService.GetAsync<List<Match>>(ShortCachingKey(leagueId));
        }

        public async Task<List<Match>> GetLongCache(int leagueId)
        {
            return await cacheService.GetAsync<List<Match>>(LongCachingKey(leagueId)) ?? new List<Match>();
        }

        public async Task<Dictionary<int, List<ReferenceAction>>> GetReferenceActions(IEnumerable<int> matchIds)
        {
            var matchIdsAsString = string.Join(",", matchIds);
            if (string.IsNullOrWhiteSpace(matchIdsAsString))
            {
                return new Dictionary<int, List<ReferenceAction>>();
            }
            else
            {
                var criteria = new GetReferenceActionCriteria { MatchIds = matchIdsAsString };

                var rawReferenceActions = await repository.FetchAsync<ReferenceAction>(criteria);

                return rawReferenceActions.GroupBy(t => t.MatchId)
                    .ToDictionary(g => g.Key, g => g.ToList());
            }
        }
    }
}