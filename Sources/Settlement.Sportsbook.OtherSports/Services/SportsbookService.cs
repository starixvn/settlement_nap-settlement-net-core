using Fanex.Data.Repository;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.OtherSports.Requests;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using System.Collections.Generic;
using Settlement.Sportsbook.OtherSports.Criteria;
using static Fanex.NAP.Client.Check;

namespace Settlement.Sportsbook.OtherSports.Services
{
    public interface SportsbookService
    {
        Task<MatchResultDetail> GetMatch(GetMatchRequest request);

        Task<MatchDetail> GetLastestResult(GetLastestResultRequest request);
    }

    public class SportsbookServiceImp : SportsbookService
    {
        private readonly IDynamicRepository repository;

        private readonly RefDataService refDataService;

        private readonly string fulltimeResource = "00";

        private readonly string halfTimeResource = "01";

        private readonly IMapper mapper;

        public SportsbookServiceImp(
            IDynamicRepository repository,
            RefDataService refDataService)
        {
            this.repository = repository;
            this.refDataService = refDataService;
            this.mapper = mapper;
        }

        public async Task<MatchResultDetail> GetMatch(GetMatchRequest request)
        {
            var criteria = new GetSportsbookMatchDetailCriteria
            {
                MatchId = request.MatchId,
                IsRefundPage = request.IsRefundPage
            };
            var result = await repository.FetchMultipleAsync<MatchDetail, ResultDetail, TicketCounts>(criteria);
            var matchDetail = result.Item1.FirstOrDefault();
            Argument.IsNotNull(matchDetail, $"Match ${criteria.MatchId} does not exist");

            matchDetail.RefDataService = refDataService;

            var providerCriteria = new GetExternalResultCriteria
            {
                MatchId = criteria.MatchId
            };

            var externalResultDetails = repository.Fetch<ResultDetail>(providerCriteria);
            matchDetail = ProviderScore(matchDetail, externalResultDetails.ToList());

            return new MatchResultDetail
            {
                MatchDetail = matchDetail,
                ResultDetail = result.Item2.ToList(),
                TicketCount = result.Item3.ToList()
            };
        }

        private MatchDetail ProviderScore(MatchDetail matchDetail, List<ResultDetail> externalResultDetails)
        {
            var fulltimeExScore = externalResultDetails.FirstOrDefault(item => item.ResourceId == fulltimeResource);
            if (fulltimeExScore != null && !string.IsNullOrEmpty(fulltimeExScore.HomeValue) && !string.IsNullOrEmpty(fulltimeExScore.AwayValue))
            {
                matchDetail.ExFTAwayScore = int.Parse(fulltimeExScore.AwayValue);
                matchDetail.ExFTHomeScore = int.Parse(fulltimeExScore.HomeValue);
            }

            var halftimeExScore = externalResultDetails.FirstOrDefault(item => item.ResourceId == halfTimeResource);
            if (halftimeExScore != null && !string.IsNullOrEmpty(halftimeExScore.HomeValue) && !string.IsNullOrEmpty(halftimeExScore.AwayValue))
            {
                matchDetail.ExHTAwayScore = int.Parse(halftimeExScore.AwayValue);
                matchDetail.ExHTHomeScore = int.Parse(halftimeExScore.HomeValue);
            }

            return matchDetail;
        }

        public async Task<MatchDetail> GetLastestResult(GetLastestResultRequest request)
        {
            var criteria = mapper.Map<GetLastestResultRequest, GetLastestResultCriteria>(request);
            var matchDetail = await repository.GetAsync<MatchDetail>(criteria);
            matchDetail.RefDataService = refDataService;

            return matchDetail;
        }
    }
}