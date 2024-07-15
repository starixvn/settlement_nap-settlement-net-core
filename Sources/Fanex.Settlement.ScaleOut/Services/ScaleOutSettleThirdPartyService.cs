using Fanex.Data.Repository;

namespace Fanex.Settlement.ScaleOut.Services;

public interface ScaleOutSettleThirdPartyService
{
    Task<ResultMessage> GetDeploymentInfo(GetDeploymentInfoRequest request);

    Task UpdateMatchInfo3rd(UpdateMatchInfo3RdRequest request);

    Task<ResultMessage> ValidateMoveBetDay(string matchIds, string eventTable, DateTime? eventDate = null);
}

public class ScaleOutSettleThirdPartyServiceImp(IDynamicRepository repository,
        IMapper mapper,
        GeneralService generalService)
    : ScaleOutSettleThirdPartyService
{
    public async Task UpdateMatchInfo3rd(UpdateMatchInfo3RdRequest request)
    {
        var criteria = mapper.Map<UpdateMatchInfo3RdRequest, UpdateMatchInfo3RdCriteria>(request);
        await repository.ExecuteAsync(criteria);
    }

    public async Task<ResultMessage> GetDeploymentInfo(GetDeploymentInfoRequest request)
    {
        var criteria = new GetDeploymentInfoCriteria { SpName = request.SpName };

        return await generalService.ExecuteAsync(criteria);
    }

    public async Task<ResultMessage> ValidateMoveBetDay(string matchIds, string eventTable, DateTime? eventDate = null)
    {
        var criteria = new ValidateMoveBetDayCriteria { MatchIds = matchIds, EventTable = eventTable, EventDate = eventDate };
        var resultValidate = await generalService.ExecuteAsync(criteria);
        if (resultValidate.ErrorCode > 0)
        {
            resultValidate.ErrorMessage =
                "Cannot proceed due to this match is in during move-bet progress. Please contact admin for support.";
        }

        return resultValidate;
    }
}