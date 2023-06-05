using Fanex.RemotingRef;
using Settlement.Core.Constants;
using Settlement.Core.Services;
using Settlement.ResourceInfos.Constants;
using Settlement.ResourceInfos.MapperFactory;

namespace Settlement.ResourceInfos.Services.BasketBall;

public class BasketballResourceNameService : IMapperService
{
    private readonly IRefDataService refDataService;

    public BasketballResourceNameService()
    {
        var remotingRefService = new RemotingRefService();
        refDataService = new RefDataService(remotingRefService);
    }

    public (string, string) GetResourceName(string resourceId, int sportType)
    {
        const int maxLength = 2;
        if (resourceId.Length == maxLength)
        {
            return (resourceId, GetResourceMain(resourceId));
        }
        var betType = resourceId[..(maxLength + 1)];
        return (betType, refDataService.GetBetTypeName(betType, resourceId[(maxLength + 1)..]));
    }

    private static string GetResourceMain(string resourceId)
    {
        return resourceId switch
        {
            ResourceType.Final => ResourceNameConstants.FullTime,
            ResourceType.Halftime => ResourceNameConstants.HalfTime,
            ResourceType.OverTime => ResourceNameConstants.OverTime,
            _ => resourceId.IndexOf("Q", StringComparison.Ordinal) > -1 ? resourceId.Replace("Q", "Quarter ") : string.Empty
        };
    }
}