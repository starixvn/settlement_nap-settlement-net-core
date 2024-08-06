using Fanex.RemotingRef;
using Settlement.Core.Services;
using Settlement.ResourceInfos.MapperFactory;

namespace Settlement.ResourceInfos.Services.BasketBall;

public class BaseballResourceNameService : IMapperService
{
    private readonly IRefDataService refDataService;

    public BaseballResourceNameService()
    {
        var remotingRefService = new RemotingRefService();
        refDataService = new RefDataService(remotingRefService);
    }

    public (string, string) GetResourceName(string resourceId, int sportType)
    {
        var betType = resourceId[..4];
        return (betType, refDataService.GetBetTypeName(betType, resourceId[4..]));
    }
}