using Settlement.BetTypeName.Constants;
using Settlement.BetTypeName.Services;
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

    private readonly IBetTypeNameService betTypeNameService;

    public EarlyBetTypeNameServiceImp(IBetTypeNameService betTypeNameService)
    {
        this.betTypeNameService = betTypeNameService;
    }

    public ResultDetail GetBetTypeName(ResultDetail item)
    {
        var resourceId = item.ResourceId;
        item.Map = Convert.ToInt32(resourceId.Substring(FourPosition, TwoPosition));
        item.BetType = resourceId[..FourPosition];
        item.BetTypeName = betTypeNameService.GetBetTypeName(resourceId, KeyConstants.ESportsKey);

        return item;
    }
}