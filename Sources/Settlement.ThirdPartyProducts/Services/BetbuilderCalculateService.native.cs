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
}