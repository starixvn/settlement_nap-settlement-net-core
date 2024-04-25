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

        if (resourceId.Length >= maxLength + 1)
        {
            var betType = resourceId[..(maxLength + 1)];
            return (betType, refDataService.GetBetTypeName(betType, resourceId[(maxLength + 1)..]));
        }

        return (resourceId, resourceId);
    }

    private static string GetResourceMain(string resourceId)
    {
        const string quarter = "Q";
        return resourceId switch
        {
            ResourceType.Final => ResourceNameConstants.FullTime,
            ResourceType.Halftime => ResourceNameConstants.HalfTime,
            ResourceType.SecondHalf => ResourceNameConstants.SecondHalf,
            ResourceType.OverTime => ResourceNameConstants.OverTime,
            _ => resourceId.IndexOf(quarter, StringComparison.Ordinal) > -1 ? resourceId.Replace(quarter, "Quarter ") : string.Empty
        };
    }
}