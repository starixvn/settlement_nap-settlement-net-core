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

        Task<MatchResultDetail> GetLastestResult(GetLastestResultRequest request);
    }

    public class SportsbookServiceImp : SportsbookService
    {
        private readonly IDynamicRepository repository;

        private readonly IRefDataService refDataService;

        private readonly IMapper mapper;

        private readonly IBetStatusService betStatusService;

        private readonly MultipleServerService multipleServerService;

        public SportsbookServiceImp(
            IDynamicRepository repository,
            IRefDataService refDataService,
            IMapper mapper,
            IBetStatusService betStatusService,
            MultipleServerService multipleServerService
            )
        {
            this.repository = repository;
            this.refDataService = refDataService;
            this.mapper = mapper;
            this.betStatusService = betStatusService;
            this.multipleServerService = multipleServerService;
        }

        public async Task<MatchResultDetail> GetMatch(GetMatchRequest request)
        {
            var (matchDetail, ticketCounts) = await multipleServerService.GetMatchInfo(request);
            Argument.IsNotNull(matchDetail, $"Match ${request.MatchId} does not exist");

            matchDetail.RefDataService = refDataService;

            var providerCriteria = new GetExternalResultCriteria
            {
                MatchId = request.MatchId
            };

            var externalResultDetails = repository.Fetch<ResultDetail>(providerCriteria);
            matchDetail = ProviderScore(matchDetail, externalResultDetails.ToList());

            var resultDetails = IsModifyResultDetailGroup(matchDetail.SportType)
                ? betStatusService.GenerateResultDetail(matchDetail) : await GetResultDetail(request.MatchId);
            var hedgeMatch = await MatchHedgeDetail(request.MatchId);

            return new MatchResultDetail
            {
                MatchDetail = matchDetail,
                ResultDetails = resultDetails,
                TicketCount = ticketCounts,
                HedgeMatchDetail = hedgeMatch
            };
        }

        private async Task<List<ResultDetail>> GetResultDetail(int matchId)
        {
            var resultDetailCriteria = new GetResultDetailCriteria { MatchidList = matchId.ToString() };
            return (await repository.FetchAsync<ResultDetail>(resultDetailCriteria)).ToList();
        }

        public bool IsModifyResultDetailGroup(int sportType)
        {
            return GroupSport.FootBall.Contains(sportType) || GroupSport.Hockey.Contains(sportType)
                   || GroupSport.Squash.Contains(sportType) || SportType.BaseBall == sportType;
        }

        private async Task<MatchHedgeDetail> MatchHedgeDetail(int matchId)
        {
            var criteria = new GetMatchDetailHedgeMatchCriteria { MatchId = matchId };
            var match = await repository.GetAsync<MatchHedgeDetail>(criteria);
            return match ?? null;
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

        public async Task<MatchResultDetail> GetLastestResult(GetLastestResultRequest request)
        {
            var criteria = mapper.Map<GetLastestResultRequest, GetLastestResultCriteria>(request);
            var matchDetail = await repository.GetAsync<MatchDetail>(criteria);
            matchDetail.RefDataService = refDataService;
            var resultDetails = IsModifyResultDetailGroup(matchDetail.SportType)
                ? betStatusService.GenerateResultDetail(matchDetail) : new List<ResultDetail>();

            return new MatchResultDetail
            {
                MatchDetail = matchDetail,
                ResultDetails = resultDetails
            };
        }
    }
}