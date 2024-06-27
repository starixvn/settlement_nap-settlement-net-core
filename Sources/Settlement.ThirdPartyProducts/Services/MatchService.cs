using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Core.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;

namespace Settlement.ThirdPartyProducts.Services;

public interface MatchService
{
    Task<MatchDetailModel> GetMatch(MatchInfoRequest request);

    Task<List<SelectionDetailModel>> GetSelection(int matchId);
}

public class MatchServiceImp(
    IRefDataService refDataService,
    IMapper mapper,
    IDynamicRepository repository,
    BetBuilderMatchesService betBuilderMatchesService,
    BetBuilderService betBuilderService)
    : MatchService
{
    public async Task<MatchDetailModel> GetMatch(MatchInfoRequest request)
    {
        var criteria = mapper.Map<MatchInfoRequest, MatchInfoCriteria>(request);
        var matchDetail = await repository.GetAsync<MatchDetailModel>(criteria);
        var resultDetails = await betBuilderMatchesService.ResultDetailByMatchIds(new List<MatchDetailModel> { matchDetail });
        matchDetail.MoreScores = betBuilderService.GetScoreByMatchId(resultDetails, matchDetail.MatchId, matchDetail.SportType, true);
        matchDetail.RefDataService = refDataService;
        return matchDetail;
    }

    public async Task<List<SelectionDetailModel>> GetSelection(int matchId)
    {
        var criteria = new SelectionDetailCriteria
        {
            MatchId = matchId,
            Resources = await betBuilderService.GetResourcesMarket(matchId)
        };

        return (await repository.FetchAsync<SelectionDetailModel>(criteria)).ToList();
    }
}