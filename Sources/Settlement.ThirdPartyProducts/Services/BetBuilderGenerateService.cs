using Fanex.Data.Repository;
using Fanex.NAP.Client;
using Fanex.Settlement.ScaleOut.Constants;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;

namespace Settlement.ThirdPartyProducts.Services;

public interface BetBuilderGenerateService
{
    string SelectedSection(List<ResourcesItemModel> selectedResources);

    Task<string> GetInfoMarket(CalculateRequest request, string selectedSelection);

    Task UpdateMatchInfo(CalculateRequest request, string selectedMarket, string selectedSelection);

    Task WriteLog(CalculateRequest request, string selectedSection);

    Task<Result> Execute(CalculateRequest request, string selectedMarket, string selectedSection);
}

public class BetBuilderGenerateServiceImp(
    INapSession currentSession,
    IHttpContextAccessor accessor,
    IDynamicRepository repository,
    XmlConvertService xmlConvertService,
    ScaleOutSettleService scaleOutSettleService,
    LogService logService,
    IOptions<AppSettingsKey> appSettingsKey) : BetBuilderGenerateService
{
    public string SelectedSection(List<ResourcesItemModel> selectedResources)
    {
        var resources = new Models.Resources<ResourcesItemModel>
        {
            ResourceItems = selectedResources
        };

        return xmlConvertService.Serialize(resources);
    }

    public async Task<string> GetInfoMarket(CalculateRequest request, string selectedSelection)
    {
        var getMarketIdCriteria = new GetMarketIdCriteria
        {
            MatchId = request.MatchId,
            Action = request.ActionName,
            SelectedSelection = selectedSelection,
            ResultStatusId = request.ActionName.Equals(ActionType.UnCalculate) ? ResultStatus.Confirmed : ResultStatus.ManuallySettled
        };

        var listMarketIds = (await repository.FetchAsync<string>(getMarketIdCriteria)).ToList();
        if (listMarketIds.Count == 0)
        {
            return string.Empty;
        }

        var resources = new ResourcesMarketIdModel
        {
            Items = listMarketIds.Select(item => new ResourceMarketItemModel { MarketId = item }).ToList()
        };

        return xmlConvertService.Serialize(resources);
    }

    public async Task UpdateMatchInfo(CalculateRequest request, string selectedMarket, string selectedSelection)
    {
        var requestUpdate = new UpdateMatchInfoRequest
        {
            MatchId = request.MatchId,
            SelectedMarket = selectedMarket,
            SelectedSelection = selectedSelection,
            IsAuto = false,
            Action = request.ActionName,
            Mode = Mode.BetBuilder
        };

        await scaleOutSettleService.UpdateMatchInfo(requestUpdate);
    }

    public async Task WriteLog(CalculateRequest request, string selectedSection)
    {
        var message = $"NAP: Calculate {request.ActionName} for matchId: {request.MatchId} {selectedSection};<br/>IsAuto:False; Bettype:38";
        await logService.WriteLog(request.MatchId, message);
    }

    public async Task<Result> Execute(CalculateRequest request, string selectedMarket, string selectedSection)
    {
        var criteria = CreateCriteria(request, selectedMarket, selectedSection);

        var tasks = appSettingsKey.Value
            .SiteDbServer
            .Select(s => CalculateByServer(s, criteria))
            .ToList();
        var results = await Task.WhenAll(tasks.ToArray());
        var resultFailed = results.Where(r => r.ErrCode > 0).ToList();
        return new Result
        {
            ErrCode = resultFailed.Count,
            ErrMsg = string.Join(" | ", resultFailed.Select(r => r.ErrMsg).ToArray())
        };
    }

    private async Task<Result> CalculateByServer(string server, CalculationCriteria criteria)
    {
        criteria.DbServer = server;
        await repository.ExecuteAsync(criteria);

        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = $"{server}: {criteria.ErrCode} - {criteria.ErrMsg}"
        };
    }

    private CalculationCriteria CreateCriteria(CalculateRequest request, string selectedMarket, string selectedSection)
    {
        return new CalculationCriteria
        {
            MatchId = request.MatchId,
            AdminId = currentSession.UserId,
            Action = request.ActionName,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            SelectedMarket = selectedMarket,
            SelectedSelection = selectedSection
        };
    }
}