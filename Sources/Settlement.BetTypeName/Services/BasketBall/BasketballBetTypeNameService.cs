using Fanex.RemotingRef;
using Settlement.BetTypeName.MapperFactory;
using Settlement.Core.Services;

namespace Settlement.BetTypeName.Services.BasketBall;

public class BasketballBetTypeNameService : IMapperService
{
    private readonly IRefDataService refDataService;

    public BasketballBetTypeNameService()
    {
        var remotingRefService = new RemotingRefService();
        refDataService = new RefDataService(remotingRefService);
    }

    public string GetResourceName(string resourceId)
    {
        const int maxLength = 2;
        var betType = resourceId[..(maxLength + 1)];
        return refDataService.GetBetTypeName(betType, resourceId[(maxLength + 1)..]);
    }
}