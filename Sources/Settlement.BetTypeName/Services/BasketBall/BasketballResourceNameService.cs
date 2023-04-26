using Fanex.RemotingRef;
using Settlement.Core.Constants;
using Settlement.Core.Services;
using Settlement.ResourceName.Constants;
using Settlement.ResourceName.MapperFactory;

namespace Settlement.ResourceName.Services.BasketBall;

public class BasketballResourceNameService : IMapperService
{
    private readonly IRefDataService refDataService;

    public BasketballResourceNameService()
    {
        var remotingRefService = new RemotingRefService();
        refDataService = new RefDataService(remotingRefService);
    }

    public string GetResourceName(string resourceId)
    {
        const int maxLength = 2;
        if (resourceId.Length == maxLength)
        {
            return GetResourceMain(resourceId);
        }
        var betType = resourceId[..(maxLength + 1)];
        return refDataService.GetBetTypeName(betType, resourceId[(maxLength + 1)..]);
    }

    private static string GetResourceMain(string resourceId)
    {
        return resourceId switch
        {
            ResourceType.Final => ResourceNameConstants.FullTime,
            ResourceType.Halftime => ResourceNameConstants.HalfTime,
            ResourceType.OverTime => ResourceNameConstants.OverTime,
            _ => resourceId.IndexOf("Q") > 0 ? resourceId.Replace("Q", "Quarter ") : string.Empty
        };
    }
}