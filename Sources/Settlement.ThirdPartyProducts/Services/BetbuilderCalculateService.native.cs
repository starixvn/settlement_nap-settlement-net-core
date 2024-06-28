using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.Settlement.ScaleOut.Constants;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Settlement.Constants;
using Settlement.Models;
using Settlement.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;

namespace Settlement.ThirdPartyProducts.Services;

public interface BetBuilderCalculateService
{
    Task<Result> Calculate(CalculateRequest request);
}

public class BetBuilderCalculateServiceImp(
    IDynamicRepository repository,
    XmlConvertService xmlConvertService,
    INapSession currentSession,
    IHttpContextAccessor accessor,
    ScaleOutSettleService scaleOutSettleService,
    LogService logService,
    IOptions<AppSettingsKey> appSettingsKey)
    : BetBuilderCalculateService
{
    private readonly AppSettingsKey appSettingsKey = appSettingsKey.Value;

    public async Task<Result> Calculate(CalculateRequest request)
    {
        var resourcesResult = CreateResources(request.Resources);
        var criteria = CreateCriteria(request.MatchId, request.ActionName, resourcesResult);
        var selectedMarket = await GetInfoMarket(criteria);
        await UpdateMatchInfo(criteria, selectedMarket);
        criteria.SelectedMarket = selectedMarket;

        var messageLog = MessageLog(criteria.MatchId, criteria.Action, criteria.SelectedSelection);

        await logService.WriteLog(criteria.MatchId, messageLog);

        await ExecuteMultiServer(criteria);

        return new Result();
    }

    private async Task ExecuteMultiServer(CalculationCriteria criteria)
    {
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
        }
    }

    private async Task UpdateMatchInfo(CalculationCriteria criteria, string selectedMarket)
    {
        var requestUpdate = new UpdateMatchInfoRequest
        {
            MatchId = criteria.MatchId,
            SelectedMarket = selectedMarket,
            SelectedSelection = criteria.SelectedSelection,
            IsAuto = false,
            Action = criteria.Action,
            Mode = Mode.BetBuilder
        };

        await scaleOutSettleService.UpdateMatchInfo(requestUpdate);
    }

    private string CreateResources(List<ResourcesItemModel> selectedResources)
    {
        var resources = new Models.Resources<ResourcesItemModel>
        {
            ResourceItems = selectedResources
        };

        return xmlConvertService.Serialize(resources);
    }

    private CalculationCriteria CreateCriteria(int matchId, string actionName, string resources) => new()
    {
        MatchId = matchId,
        AdminId = currentSession.UserId,
        Action = actionName,
        Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
        SelectedSelection = resources
    };

    private async Task<string> GetInfoMarket(CalculationCriteria criteria)
    {
        var getMarketIdCriteria = new GetMarketIdCriteria
        {
            MatchId = criteria.MatchId,
            Action = criteria.Action,
            SelectedSelection = criteria.SelectedSelection,
            ResultStatusId = criteria.Action == ActionType.UnCalculate ? ResultStatus.Running : ResultStatus.ManuallySettled
        };

        var listMarketIds = (await repository.FetchAsync<string>(getMarketIdCriteria)).ToList();
        var resources = new ResourcesMarketIdModel
        {
            Items = listMarketIds.Select(item => new ResourceMarketItemModel { MarketId = item }).ToList()
        };

        return xmlConvertService.Serialize(resources);
    }

    private static string MessageLog(int matchId, string action, string resources)
    {
        return $"NAP: Calculate {action} for matchId: {matchId} {(string.IsNullOrEmpty(resources) ? string.Empty : resources + "<br/>")}; IsAuto:false; Bettype:38";
    }
}