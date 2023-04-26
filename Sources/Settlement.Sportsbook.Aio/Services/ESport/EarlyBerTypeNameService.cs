using Settlement.ResourceName.Constants;
using Settlement.ResourceName.Services;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.ESport;

public interface IEarlyBetTypeNameService
{
    ResultDetail GetBetTypeName(ResultDetail item);
}

public class EarlyBetTypeNameServiceImp : IEarlyBetTypeNameService
{
    private const int TwoPosition = 2;
    private const int FourPosition = 4;

    private readonly IResourceNameService resourceNameService;

    public EarlyBetTypeNameServiceImp(IResourceNameService resourceNameService)
    {
        this.resourceNameService = resourceNameService;
    }

    public ResultDetail GetBetTypeName(ResultDetail item)
    {
        var resourceId = item.ResourceId;
        item.Map = Convert.ToInt32(resourceId.Substring(FourPosition, TwoPosition));
        item.BetType = resourceId[..FourPosition];
        item.BetTypeName = resourceNameService.GetResourceName(resourceId, KeyConstants.ESportsKey);

        return item;
    }
}