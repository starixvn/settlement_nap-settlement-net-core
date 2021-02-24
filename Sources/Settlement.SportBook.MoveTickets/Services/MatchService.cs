using Fanex.Caching;
using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Criterias;
using Settlement.Sportsbook.MoveTickets.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace Settlement.Sportsbook.MoveTickets.Services
{
    public interface IMatchService
    {
        MultiSportResult GetMatchesAndResultDetails(ICriteria criteria);

        MultiSportResult GetOverOnlyMatch(ICriteria criteria);

        MultiSportResult GetHalftimeOverOnlyMatch(ICriteria criteria);

        MultiSportResult GetWaitingMatches(GetWaitingMatchesCriteria criteria);

        List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, int groupSport);
    }

    public class MatchService : IMatchService
    {
        private static int _isProcessing;

        private readonly IDynamicRepository repository;

        private readonly ICacheService cacheService;

        private readonly IMatchResultDetailService matchResultDetailService;

        private readonly IRefDataService refDataService;

        public MatchService(
            IDynamicRepository repository,
            IMatchResultDetailService matchResultDetailService,
            IRefDataService refDataService,
            ICacheService cacheService)
        {
            this.repository = repository;
            this.matchResultDetailService = matchResultDetailService;
            this.refDataService = refDataService;
            this.cacheService = cacheService;
        }

        public MultiSportResult GetMatchesAndResultDetails(ICriteria criteria)
        {
            var result = repository.FetchMultiple<Match, ResultDetail>(criteria);

            return new MultiSportResult
            {
                Matches = result.Item1.ToList(),
                ResultDetails = result.Item2.ToList()
            };
        }

        public MultiSportResult GetOverOnlyMatch(ICriteria criteria)
        {
            return GetMatchesAndResultDetails(criteria);
        }

        public MultiSportResult GetHalftimeOverOnlyMatch(ICriteria criteria)
        {
            return GetOverOnlyMatch(criteria);
        }

        public List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, int groupSport)
        {
            if (sportType == SportType.Cricket)
            {
                return matchResultDetailService.CricketResultDetail(matches, resultDetails);
            }

            foreach (var result in matches)
            {
                result.RefDataService = refDataService;
                result.GroupSport = groupSport;
            }

            return matches;
        }

        public MultiSportResult GetWaitingMatches(GetWaitingMatchesCriteria criteria)
        {
            var matches = MatchesOnShortCaching(criteria.SportType);

            if (matches != null)
            {
                return matches;
            }

            if (0 == Interlocked.Exchange(ref _isProcessing, 1))
            {
                try
                {
                    return GetAndCachingMatches(criteria);
                }
                finally
                {
                    Interlocked.Exchange(ref _isProcessing, 0);
                }
            }

            return MatchesOnLongCaching(criteria.SportType) ?? new MultiSportResult { Matches = new List<Match>() };
        }

        private MultiSportResult GetAndCachingMatches(GetWaitingMatchesCriteria criteria)
        {
            var matchesAndResultDetail = GetMatchesAndResultDetails(criteria);
            SetToCache(criteria.SportType, matchesAndResultDetail);

            return matchesAndResultDetail;
        }

        private MultiSportResult MatchesOnShortCaching(int sportType)
        {
            var shortCachingKey = ShortCachingKey(sportType);
            return cacheService.Get<MultiSportResult>(shortCachingKey);
        }

        private MultiSportResult MatchesOnLongCaching(int sportType)
        {
            var longCachingKey = LongCachingKey(sportType);
            return cacheService.Get<MultiSportResult>(longCachingKey);
        }

        private void SetToCache(int sportType, MultiSportResult matchesAndResultDetail)
        {
            var shortCachingKey = ShortCachingKey(sportType);
            var longCachingKey = LongCachingKey(sportType);
            const int shortCacheExpirationTime = 3;
            const int longCacheExpirationTime = 20;
            cacheService.Set(shortCachingKey, matchesAndResultDetail, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromSeconds(shortCacheExpirationTime)));
            cacheService.Set(longCachingKey, matchesAndResultDetail, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(longCacheExpirationTime)));
        }

        private static string ShortCachingKey(int sportType) => $"{CacheServiceKey.WaitingListCacheKey}-{sportType}";

        private static string LongCachingKey(int sportType) => $"{ShortCachingKey(sportType)}-longCaching";
    }
}