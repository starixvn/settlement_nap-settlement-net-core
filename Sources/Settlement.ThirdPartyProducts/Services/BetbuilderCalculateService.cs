using Fanex.Settlement.ScaleOut.Constants;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using ILogService = Settlement.Core.Services.LogService;


namespace Settlement.ThirdPartyProducts.Services;

public interface BetBuilderCalculateService
{
    Task<Result> Calculate(CalculateRequest request);
}

public class BetBuilderCalculateServiceImp(
    BetBuilderGenerateService betBuilderGenerateService,
    XmlConvertService xmlConvertService,
    ILogService logService,
    IBetbuilderResultAmendmentService betbuilderResultAmendmentService
    )
    : BetBuilderCalculateService
{
    public async Task<Result> Calculate(CalculateRequest request)
    {
        var selectedSection = betBuilderGenerateService.SelectedSection(request.Resources);
        var (selectedMarket, _) = await betBuilderGenerateService.GetInfoMarket(request, selectedSection);

        await betBuilderGenerateService.UpdateMatchInfo(request, selectedMarket, selectedSection);

        await betBuilderGenerateService.WriteLog(request, selectedSection);

        if (string.IsNullOrWhiteSpace(selectedMarket))
        {
            return new Result();
        }

        var selectedResources = GetResourcesSelection(request.Resources);

        await WriteSettleLog(request, selectedResources);

        var isAmend = await HandleResultAmend(request, selectedResources);

        var result = await betBuilderGenerateService.Execute(request, selectedMarket, selectedSection);

        result.HasResultAmendment = isAmend;
        result.SettledSessionId = request.BroadcastSessionId;

        return result;
    }

    private async Task<bool> HandleResultAmend(CalculateRequest request, string selectedResources)
    {
        if (request.ActionName.Equals(ActionType.CalculateAll))
        {
            var results = await betbuilderResultAmendmentService.GetResultChanged(request, selectedResources);
            if (results.Any())
            {
                var currentSelection = request.Resources
                    .Select(resource => new Fanex.Settlement.MessageBridge.ResultAmendment.ResourceItem
                    {
                        ResourceId = resource.SelectionType.ToString(),
                        HomeValue = resource.Result,
                    })
                    .ToList();

                await betbuilderResultAmendmentService.PublishResultAmendment(request, currentSelection, results);
                return true;
            }
        }

        return false;
    }

    private string GetResourcesSelection(List<ResourcesItemModel> resources)
    {
        var items = resources
            .Select(resource => new Core.Models.ResourceItem
            {
                ResourceId = resource.SelectionType.ToString(),
                HomeValue = resource.Result,
            })
            .ToList();

        var resourceRoot = new Core.Models.Resources<Core.Models.ResourceItem>
        {
            ResourceItems = items
        };

        var selectedResources = xmlConvertService.Serialize(resourceRoot);

        return selectedResources;
    }


    private async Task WriteSettleLog(CalculateRequest request, string selectedResources)
    {

        var criteria = new InsertLogCriteria
        {
            MatchId = request.MatchId,
            Action = request.ActionName,
            Mode = Mode.BetBuilder,
            Sporttype = request.SportType,
            IsAuto = false,
            SelectedResources = selectedResources
        };

        await logService.WriteLog(criteria);
    }
}