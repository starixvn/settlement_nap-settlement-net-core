using Fanex.Settlement.ScaleOut.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.ThirdPartyProducts.Requests;

namespace Settlement.ThirdPartyProducts.Services;

public interface BetBuilderCalculateService
{
    Task<Result> Calculate(CalculateRequest request);
}

public class BetBuilderCalculateServiceImp(
    BetBuilderGenerateService betBuilderGenerateService)
    : BetBuilderCalculateService
{
    public async Task<Result> Calculate(CalculateRequest request)
    {
        var selectedSection = betBuilderGenerateService.SelectedSection(request.Resources);
        var selectedMarket = await betBuilderGenerateService.GetInfoMarket(request, selectedSection);

        await betBuilderGenerateService.UpdateMatchInfo(request, selectedMarket, selectedSection);

        await betBuilderGenerateService.WriteLog(request, selectedSection);

        if (string.IsNullOrWhiteSpace(selectedMarket))
        {
            return new Result();
        }

        return await betBuilderGenerateService.Execute(request, selectedMarket, selectedSection);
    }

    private async Task WriteSettleLog(CalculateRequest request)
    {
        var items = request.Resources.Select(x => new ResourceItem
        {
            ResourceId = x.SelectionType.ToString(),
            HomeValue = x.Result,

        }).ToList();
        var criteria = new InsertLogCriteria
        {
            MatchId = request.MatchId,
            Action = request.ActionName,
            Mode = Mode.BetBuilder,
            Sporttype = request.SportType,
            IsAuto = false,
        };
    }
}