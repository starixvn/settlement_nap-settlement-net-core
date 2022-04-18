using Fanex.Data.Repository;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.OtherSports.Requests;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using System.Collections.Generic;
using Settlement.Sportsbook.OtherSports.Constants;
using Settlement.Sportsbook.OtherSports.Criteria;
using static Fanex.NAP.Client.Check;
using MatchResultDetail = Settlement.Sportsbook.OtherSports.Models.MatchResultDetail;
using Settlement.Core.Constants;

namespace Settlement.Sportsbook.OtherSports.Services
{
    public interface SportsbookService
    {
        bool IsModifyResultDetailGroup(int sportType);

        Task<MatchResultDetail> GetMatch(GetMatchRequest request);

        Task<MatchDetail> GetLastestResult(GetLastestResultRequest request);
    }

    public class SportsbookServiceImp : SportsbookService
    {
        private readonly IDynamicRepository repository;

        private readonly IRefDataService refDataService;

        private readonly IMapper mapper;

        private readonly IBetStatusService betStatusService;

        public SportsbookServiceImp(
            IDynamicRepository repository,
            IRefDataService refDataService,
            IMapper mapper,
            IBetStatusService betStatusService
            )
        {
            this.repository = repository;
            this.refDataService = refDataService;
            this.mapper = mapper;
            this.betStatusService = betStatusService;
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

            var resultDetails = IsModifyResultDetailGroup(matchDetail.SportType)
                ? betStatusService.GenerateResultDetail(matchDetail) : result.Item2.ToList();

            return new MatchResultDetail
            {
                MatchDetail = matchDetail,
                ResultDetails = resultDetails,
                TicketCount = result.Item3.ToList()
            };
        }

        public bool IsModifyResultDetailGroup(int sportType)
        {
            return GroupSport.FootBall.Contains(sportType) || GroupSport.Hockey.Contains(sportType) ||
                   SportType.BaseBall == sportType;
        }

        private static MatchDetail ProviderScore(MatchDetail matchDetail, IReadOnlyCollection<ResultDetail> externalResultDetails)
        {
            const string fullTimeResource = "00";
            const string halfTimeResource = "01";

            var fullTimeExScore = externalResultDetails.FirstOrDefault(item => item.ResourceId == fullTimeResource);
            if (fullTimeExScore != null && !string.IsNullOrEmpty(fullTimeExScore.HomeValue) &&
                !string.IsNullOrEmpty(fullTimeExScore.AwayValue))
            {
                matchDetail.ExternalSourceName = fullTimeExScore.SourceName;
                matchDetail.ExFTAwayScore = int.Parse(fullTimeExScore.AwayValue);
                matchDetail.ExFTHomeScore = int.Parse(fullTimeExScore.HomeValue);
            }

            var halftimeExScore = externalResultDetails.FirstOrDefault(item => item.ResourceId == halfTimeResource);
            if (halftimeExScore != null && !string.IsNullOrEmpty(halftimeExScore.HomeValue) &&
                !string.IsNullOrEmpty(halftimeExScore.AwayValue))
            {
                matchDetail.ExternalSourceName = halftimeExScore.SourceName;
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