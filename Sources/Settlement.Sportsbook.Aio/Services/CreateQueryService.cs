using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;

namespace Settlement.Sportsbook.Aio.Services;

public interface ICreateQueryService
{
    SettleCriteria QuerySettle(SettleRequest request);

    SaveScoreRequest QuerySaveScore(SaveScoreRequest request);

    SettleCriteria QuerySettleChildMatch(SettleChildMatchRequest request);

    ResultSettingCriteria QueryChangeSetting(ResultSettingRequest request);

    string CreateResourceChildMatch(ChildMatchModel childMatch);

    string CreateResources<T>(List<T> selectedResources);

    GetRecalResultCriteria QueryRecalResult(GetRecalResultRequest request);

    void WriteLogChildMatch(SettleCriteria criteria, Result result);
}

public class CreateQueryServiceImp(
    XmlConvertService xmlConvertService,
    INapSession currentSession,
    IHttpContextAccessor accessor,
    IMapper mapper,
    LogService logService)
    : ICreateQueryService
{
    public SettleCriteria QuerySettle(SettleRequest request)
    {
        var resourcesResult = CreateResources(request.SelectedResources);
        var criteria = mapper.Map<SettleRequest, SettleCriteria>(request);
        criteria.AdminId = currentSession.UserId;
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
        criteria.SelectedResources = resourcesResult;
        return criteria;
    }

    public SettleCriteria QuerySettleChildMatch(SettleChildMatchRequest request)
    {
        var resourcesResult = CreateResources(request.SelectedResources);
        var criteria = mapper.Map<SettleChildMatchRequest, SettleCriteria>(request);
        criteria.AdminId = currentSession.UserId;
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
        criteria.SelectedResources = resourcesResult;
        criteria.IsChildMatch = true;  //auto set
        criteria.BroadcastSessionId = request.SportType == SportType.Cricket
            ? request.ParentSessionId
            : criteria.BroadcastSessionId;

        return criteria;
    }

    public string CreateResources<T>(List<T> selectedResources)
    {
        var resources = new Resources<T>
        {
            ResourceItems = selectedResources
        };

        return xmlConvertService.Serialize(resources);
    }

    private string CreateScoreResources(List<SaveScoreModel> selectedResources)
    {
        var resources = new SaveScoreResources<SaveScoreModel>
        {
            SourceItems = selectedResources
        };

        return xmlConvertService.Serialize(resources);
    }

    public string CreateResourceChildMatch(ChildMatchModel childMatch)
    {
        var resource = new Resources<ResourceItem>
        {
            ResourceItems = new List<ResourceItem> { mapper.Map<ChildMatchModel, ResourceItem>(childMatch) }
        };

        return xmlConvertService.Serialize(resource);
    }

    public SaveScoreRequest QuerySaveScore(SaveScoreRequest request)
    {
        var scoreToSaveResources = CreateScoreResources(request.ScoresToSave);
        var scoreResources = CreateScoreResources(request.CheckedScores);
        return new SaveScoreRequest
        {
            MatchId = request.MatchId,
            UserId = currentSession.UserId,
            OutsideSources = scoreToSaveResources,
            Sources = scoreResources,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            ApiKey = request.ApiKey,
            IsTrader = request.IsTrader
        };
    }

    public ResultSettingCriteria QueryChangeSetting(ResultSettingRequest request)
    {
        var criteria = mapper.Map<ResultSettingRequest, ResultSettingCriteria>(request);

        criteria.AdminId = currentSession.UserId;
        criteria.SelectedResources = request.SelectedResources == null
            ? string.Empty
            : CreateResources(request.SelectedResources.ToList());

        return criteria;
    }

    public GetRecalResultCriteria QueryRecalResult(GetRecalResultRequest request)
    {
        var criteria = mapper.Map<GetRecalResultRequest, GetRecalResultCriteria>(request);
        return criteria;
    }

    public void WriteLogChildMatch(SettleCriteria criteria, Result result)
    {
        if (!string.IsNullOrWhiteSpace(result.ErrMsg))
        {
            const int actionCalculate = 100;
            logService.ActionLog(criteria.MatchId, result.ErrMsg, actionCalculate);
        }
    }
}