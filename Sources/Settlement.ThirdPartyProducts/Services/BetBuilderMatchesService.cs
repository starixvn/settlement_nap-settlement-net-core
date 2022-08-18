using AutoMapper;
using Fanex.Caching;
using Fanex.Data.Repository;
using Settlement.Core.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.ThirdPartyProducts.Services
{
    public interface BetBuilderMatchesService
    {
        Task<List<SportModel>> Search(FilterRequest request);

        Task<List<MatchDetailModel>> RefreshMatches(MatchesWaitingRequest request);
    }

    public class BetBuilderMatchesServiceImp : BetBuilderMatchesService
    {
        private readonly IDynamicRepository repository;

        private readonly IRefDataService refDataService;

        private readonly IMapper mapper;

        private readonly MatchService matchService;

        private readonly MergeMatchInfo mergeMatchInfo;

        private readonly CachingMatchesService cachingMatchesService;

        private static int _isProcessing;

        public BetBuilderMatchesServiceImp(IDynamicRepository repository,
                IRefDataService refDataService,
                IMapper mapper,
                MatchService matchService,
                MergeMatchInfo mergeMatchInfo,
                CachingMatchesService cachingMatchesService)
        {
            this.repository = repository;
            this.refDataService = refDataService;
            this.mapper = mapper;
            this.matchService = matchService;
            this.mergeMatchInfo = mergeMatchInfo;
            this.cachingMatchesService = cachingMatchesService;
        }

        public async Task<List<SportModel>> Search(FilterRequest request)
        {
            var criteria = mapper.Map<FilterRequest, MatchesCriteria>(request);
            var matches = await GetMatches(criteria);
            var resultDetails = await matchService.ResultDetailByMatchIds(matches);

            matches.ForEach(match =>
            {
                match.RefDataService = refDataService;
                match.MoreScores = matchService.GetScoreByMatchId(resultDetails, match.MatchId, match.SportType, false);
            });

            var leagues = matchService.CreateLeagues(matches);
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
            var matches = cachingMatchesService.MatchesOnShortCaching(request.LeagueIds);

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

            return cachingMatchesService.MatchesOnLongCaching(request.LeagueIds);
        }

        private async Task<List<MatchDetailModel>> GetAndCachingMatches(MatchesWaitingRequest request)
        {
            var criteria = mapper.Map<MatchesWaitingRequest, MatchesCriteria>(request);
            var matches = await GetMatches(criteria);
            var resultDetails = await matchService.ResultDetailByMatchIds(matches);

            matches.ForEach(match =>
            {
                match.RefDataService = refDataService;
                match.MoreScores = matchService.GetScoreByMatchId(resultDetails, match.MatchId, match.SportType, false);
            });

            cachingMatchesService.SetToCache(request.LeagueIds, matches);

            return matches;
        }

        private async Task<List<MatchDetailModel>> GetMatches(CriteriaBase criteria)
        {
            var matches = (await repository.FetchAsync<MatchDetailModel>(criteria)).ToList();
            await matchService.AddTicketInfo(matches);
            SetNewMatchInfo(matches);
            return matches;
        }

        private List<MatchDetailModel> SetNewMatchInfo(List<MatchDetailModel> matches)
        {
            foreach (var match in matches)
            {
                match.ParlayStatus = mergeMatchInfo.ParlayStatus(match);
                match.QueueStatus = mergeMatchInfo.QueueStatus(match);
            }

            return matches;
        }
    }
}