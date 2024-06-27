using Settlement.ResourceInfos.Constants;
using Settlement.ResourceInfos.Services;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.ESport;

public interface IEarlyBetTypeNameService
{
    ResultDetail GetBetTypeName(ResultDetail item);
}

public class EarlyBetTypeNameServiceImp(IResourceNameService resourceNameService) : IEarlyBetTypeNameService
{
    private const int TwoPosition = 2;
    private const int FourPosition = 4;

    public ResultDetail GetBetTypeName(ResultDetail item)
    {
        var resourceId = item.ResourceId;
        item.Map = Convert.ToInt32(resourceId.Substring(FourPosition, TwoPosition));
        (item.BetType, item.BetTypeName) = resourceNameService.GetResourceName(resourceId, KeyConstants.ESportsKey);

        return item;
    }
}