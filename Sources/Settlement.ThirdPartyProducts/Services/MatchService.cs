using AutoMapper;
using Fanex.Caching;
using Fanex.Data.Repository;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.ThirdPartyProducts.Services
{
    public interface MatchService
    {
        Task<List<SportModel>> Search(FilterRequest request);

        Task<List<MatchDetailModel>> RefreshMatches(MatchesWaitingRequest request);

        Task<MatchDetailModel> GetMatch(MatchInfoRequest request);
    }

    public class MatchServiceImp : MatchService
    {
        private static int _isProcessing;

        private readonly ICacheService cacheService;

        private readonly IDynamicRepository repository;

        private readonly RefDataService refDataService;

        private readonly ScoreService scoreService;

        public MatchServiceImp(
            ICacheService cacheService,
            RefDataService refDataService,
            ScoreService scoreService,
            IDynamicRepository repository)
        {
            this.cacheService = cacheService;
            this.refDataService = refDataService;
            this.scoreService = scoreService;
            this.repository = repository;
        }

        public async Task<List<SportModel>> Search(FilterRequest request)
        {
            var criteria = Mapper.Map<FilterRequest, MatchesCriteria>(request);
            var data = await repository.FetchMultipleAsync<MatchDetailModel, ResultDetail>(criteria);
            var matches = data.Item1.ToList();
            var resultDetails = data.Item2.ToList();

            matches.ForEach(match =>
            {
                match.RefDataService = refDataService;
                match.MoreScores = GetScoreByMatchId(resultDetails, match.MatchId, match.SportType, false);
            });

            var leagues = CreateLeagues(matches);
            var sportbook = leagues.GroupBy(item => new { item.SportType, item.SportName }).Select(item => new SportModel
            {
                Id = item.Key.SportType,
                Name = item.Key.SportName,
                Leagues = item.OrderBy(league => league.LeagueName).ToList()
            }).ToList();

            return sportbook;
        }

        public async Task<List<MatchDetailModel>> RefreshMatches(MatchesWaitingRequest request)
        {
            var matches = MatchesOnShortCaching(request.LeagueIds);

            if (matches != null && matches.Count > 0)
            {
                return matches;
            }

            if (0 == Interlocked.Exchange(ref _isProcessing, 1))
            {
                try
                {
                    return await GetAndCachingMatches(request);
                }
                finally
                {
                    Interlocked.Exchange(ref _isProcessing, 0);
                }
            }

            return MatchesOnLongCaching(request.LeagueIds);
        }

        public async Task<MatchDetailModel> GetMatch(MatchInfoRequest request)
        {
            var criteria = Mapper.Map<MatchInfoRequest, MatchInfoCriteria>(request);
            var data = await repository.FetchMultipleAsync<MatchDetailModel, ResultDetail>(criteria);

            var matchDetail = data.Item1.FirstOrDefault();
            var resultDetails = data.Item2.ToList();
            matchDetail.MoreScores = GetScoreByMatchId(resultDetails, matchDetail.MatchId, matchDetail.SportType, true);
            matchDetail.RefDataService = refDataService;
            return matchDetail;
        }

        private List<MatchDetailModel> MatchesOnShortCaching(string leagueIds)
        {
            var shortCachingKey = ShortCachingKey(leagueIds);
            return cacheService.Get<List<MatchDetailModel>>(shortCachingKey);
        }

        private List<MatchDetailModel> MatchesOnLongCaching(string leagueIds)
        {
            var longCachingKey = LongCachingKey(leagueIds);
            return cacheService.Get<List<MatchDetailModel>>(longCachingKey);
        }

        private static string ShortCachingKey(string leagueIds) => $"{CacheServiceKey.WaitingBetBuilderCacheKey}-{leagueIds}";

        private static string LongCachingKey(string leagueIds) => $"{ShortCachingKey(leagueIds)}-longCaching";

        private async Task<List<MatchDetailModel>> GetAndCachingMatches(MatchesWaitingRequest request)
        {
            var criteria = Mapper.Map<MatchesWaitingRequest, MatchesWaitingCriteria>(request);
            var data = await repository.FetchMultipleAsync<MatchDetailModel, ResultDetail>(criteria);
            var matches = data.Item1.ToList();
            var resultDetails = data.Item2.ToList();
            matches.ForEach(match =>
            {
                match.RefDataService = refDataService;
                match.MoreScores = GetScoreByMatchId(resultDetails, match.MatchId, match.SportType, false);
            });

            SetToCache(request.LeagueIds, matches);

            return matches;
        }

        private void SetToCache(string leagueIds, List<MatchDetailModel> matches)
        {
            var shortCachingKey = ShortCachingKey(leagueIds);
            var longCachingKey = LongCachingKey(leagueIds);
            const int shortCacheExpirationTime = 3;
            const int longCacheExpirationTime = 20;
            cacheService.Set(shortCachingKey, matches, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromSeconds(shortCacheExpirationTime)));
            cacheService.Set(longCachingKey, matches, new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(longCacheExpirationTime)));
        }

        private MoreScores GetScoreByMatchId(List<ResultDetail> resultDetails, int matchId, int sportType, bool isPopup)
        {
            var resultDetailByMatchId = resultDetails.Where(m => m.MatchId == matchId).ToList();
            return new MoreScores
            {
                HalfTimeScore = scoreService.HalftimeScore(resultDetailByMatchId, sportType),
                FinalScore = scoreService.FinalScore(resultDetailByMatchId, sportType),
                Sets = scoreService.ScoreOfSets(resultDetailByMatchId, sportType, isPopup),
            };
        }

        private List<LeagueModel> CreateLeagues(List<MatchDetailModel> matches)
        {
            var leagueIds = matches.GroupBy(m => m.LeagueId).Select(m => m.Key).ToList();
            var leagues = new List<LeagueModel>();
            foreach (var leagueId in leagueIds)
            {
                var matchesByLeagueId = matches.Where(m => m.LeagueId == leagueId).ToList();
                var league = LeagueItem(leagueId, matchesByLeagueId);
                leagues.Add(league);
            }

            return leagues.OrderBy(item => item.SportType).ToList();
        }

        private LeagueModel LeagueItem(int leagueId, List<MatchDetailModel> matches)
        {
            var isAutoSettingForLeague = matches[0].AutoCalcSetting.IsAutoSettingForLeague;
            var sportType = matches[0].SportType;
            return new LeagueModel
            {
                SportType = sportType,
                LeagueId = leagueId,
                IsAutoSettingForLeague = isAutoSettingForLeague,
                Matches = SortMatch(matches),
                RefDataService = refDataService
            };
        }

        private static List<MatchDetailModel> SortMatch(IEnumerable<MatchDetailModel> matches)
        {
            var eventStatuses = new List<string>
            {
                "Running",
                "Result Pending",
                "Postponed",
                "Internal",
                "Closed",
                "Completed",
                "Refund HT",
                "Refund FT",
                "Refund"
            };
            return matches.OrderBy(match => eventStatuses.IndexOf(match.EventStatus))
                          .ThenBy(match => match.KickOffTime)
                          .ThenBy(match => match.MatchId)
                          .ToList();
        }
    }
}