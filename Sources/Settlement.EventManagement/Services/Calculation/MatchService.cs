using Fanex.Caching;
using Fanex.Data.Repository;
using Settlement.Core.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Match = Settlement.EventManagement.Models.Calculation.Match;
using Microsoft.Extensions.Configuration;
using Settlement.Core.Models;
using Settlement.EventManagement.Criteria;
using Settlement.Core.Constants;

namespace Settlement.EventManagement.Services.Calculation
{
    public interface MatchService
    {
        Task<List<Match>> GetMatches(FilterMatchRequest request);
    }

    public class MatchServiceImp : MatchService
    {
        private readonly IDynamicRepository repository;

        private readonly ICacheService cacheService;

        private readonly IRefDataService refDataService;

        private readonly MergeDataService mergeDataService;

        private readonly NewInfoMatchService newInfoMatchService;

        private readonly IConfiguration configuration;

        private readonly IMapper mapper;

        public MatchServiceImp(
            IDynamicRepository repository,
            IRefDataService refDataService,
            ICacheService cacheService,
            MergeDataService mergeDataService,
            NewInfoMatchService newInfoMatchService,
            IConfiguration configuration,
            IMapper mapper)
        {
            this.repository = repository;
            this.refDataService = refDataService;
            this.cacheService = cacheService;
            this.mergeDataService = mergeDataService;
            this.newInfoMatchService = newInfoMatchService;
            this.configuration = configuration;
            this.mapper = mapper;
        }

        public async Task<List<Match>> GetMatches(FilterMatchRequest request)
        {
            var matches = await MatchesAllSites(request);
            var listResultDetail = await ResultDetailByMatchIds(matches);
            foreach (var match in matches)
            {
                var listSourceByMatchId = listResultDetail.Where(m => m.MatchId == match.MatchId && m.SourceId != SourceType.Normal).ToList();
                var resultDetailByMatchId = listResultDetail.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();

                match.NewEventStatus = newInfoMatchService.NewEventStatus(match);
                match.EventStatusColor = newInfoMatchService.EventStatusColor(match);
                match.EarlySettleStatus = newInfoMatchService.EarlySettlementStatus(match);
                match.AutoSettleFastMarket = newInfoMatchService.AutoSettleFastMarket(match);
                match.ConfirmHalfTimeScore = newInfoMatchService.ConfirmScore(listSourceByMatchId, ResourceType.Halftime);
                match.ConfirmFullTimeScore = newInfoMatchService.ConfirmScore(listSourceByMatchId, ResourceType.Final);
                match.IsNotConsistentExHtScore = newInfoMatchService.IsNotConsistentScore(match.SuspenderHalfTime, resultDetailByMatchId, listSourceByMatchId, ResourceType.Halftime);
                match.IsNotConsistentExFtScore = newInfoMatchService.IsNotConsistentScore(match.SuspenderFullTime, resultDetailByMatchId, listSourceByMatchId, ResourceType.Final);
                match.RefDataService = refDataService;
            }

            return matches;
        }

        private async Task<List<Match>> MatchesAllSites(FilterMatchRequest request)
        {
            var matches = new List<Match>();
            var isCentralDataBase = true;
            var criteria = mapper.Map<FilterMatchRequest, GetMatchesCriteria>(request);
            var siteDbServer = configuration.GetSection("SiteDBServer").Get<List<string>>();
            foreach (var server in siteDbServer)
            {
                criteria.DbServer = server;
                var data = (await repository.FetchAsync<Match>(criteria)).ToList();

                if (isCentralDataBase)
                {
                    matches = data;
                    isCentralDataBase = false;
                }
                else
                {
                    mergeDataService.MergeMatches(matches, data);
                }
            }

            return matches;
        }

        private async Task<List<ResultDetail>> ResultDetailByMatchIds(List<Match> matches)
        {
            var listMatchId = string.Join(",", matches.Select(match => match.MatchId.ToString()).ToArray());
            var resultDetailCriteria = new GetResultDetailCriteria { MatchIdList = listMatchId };
            return (await repository.FetchAsync<ResultDetail>(resultDetailCriteria)).ToList();
        }
    }
}
