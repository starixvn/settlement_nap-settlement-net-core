namespace Settlement.Sportsbook.OtherSports.Services;

using AutoMapper;
using Constants;
using Criteria;
using Fanex.Data.Repository;
using Requests;
using Settlement.Core.Models;
using Settlement.Core.Services;
using MatchResultDetail = Models.MatchResultDetail;

public interface SportsbookService
{
    bool IsModifyResultDetailGroup(int sportType);

    Task<MatchResultDetail> GetMatch(GetMatchRequest request);

    Task<MatchResultDetail> GetLatestResult(GetLatestResultRequest request);
}

public class SportsbookServiceImp(
    IDynamicRepository repository,
    IRefDataService refDataService,
    IMapper mapper,
    GenerateService generateService,
    MultipleServerService multipleServerService)
    : SportsbookService
{
    public async Task<MatchResultDetail> GetMatch(GetMatchRequest request)
    {
        var (matchDetail, ticketCounts) = await multipleServerService.GetMatchInfo(request);

        matchDetail.RefDataService = refDataService;

        var providerCriteria = new GetExternalResultCriteria
        {
            MatchId = request.MatchId
        };

        var externalResultDetails = await repository.FetchAsync<ResultDetail>(providerCriteria);
        matchDetail = ProviderScore(matchDetail, [.. externalResultDetails]);

        var resultDetails = IsModifyResultDetailGroup(matchDetail.SportType)
            ? generateService.GenerateResultDetail(matchDetail) : await GetResultDetail(request.MatchId);
        var hedgeMatch = await MatchHedgeDetail(request.MatchId);

        return new MatchResultDetail
        {
            MatchDetail = matchDetail,
            ResultDetails = resultDetails,
            TicketCount = ticketCounts,
            HedgeMatchDetail = hedgeMatch,
        };
    }

    private async Task<List<ResultDetail>> GetResultDetail(int matchId)
    {
        var resultDetailCriteria = new GetResultDetailCriteria { MatchIdList = matchId.ToString() };
        return (await repository.FetchAsync<ResultDetail>(resultDetailCriteria)).ToList();
    }

    public bool IsModifyResultDetailGroup(int sportType)
    {
        return GroupSport.FootBall.Contains(sportType) || GroupSport.Hockey.Contains(sportType)
               || GroupSport.Squash.Contains(sportType);
    }

    private async Task<MatchHedgeDetail> MatchHedgeDetail(int matchId)
    {
        var criteria = new GetMatchDetailHedgeMatchCriteria { MatchId = matchId };
        var match = await repository.GetAsync<MatchHedgeDetail>(criteria);
        return match;
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
            matchDetail.ExternalHTSourceName = halftimeExScore.SourceName;
            matchDetail.ExHTAwayScore = int.Parse(halftimeExScore.AwayValue);
            matchDetail.ExHTHomeScore = int.Parse(halftimeExScore.HomeValue);
        }

        return matchDetail;
    }

    public async Task<MatchResultDetail> GetLatestResult(GetLatestResultRequest request)
    {
        var criteria = mapper.Map<GetLatestResultRequest, GetLatestResultCriteria>(request);
        var matchDetail = await repository.GetAsync<MatchDetail>(criteria);
        matchDetail.RefDataService = refDataService;
        var resultDetails = IsModifyResultDetailGroup(matchDetail.SportType)
            ? generateService.GenerateResultDetail(matchDetail) : [];

        return new MatchResultDetail
        {
            MatchDetail = matchDetail,
            ResultDetails = resultDetails
        };
    }
}