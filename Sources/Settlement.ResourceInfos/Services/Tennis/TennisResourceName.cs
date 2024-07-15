using Fanex.RemotingRef;
using Settlement.Core.Constants;
using Settlement.Core.Services;
using Settlement.ResourceInfos.Constants;
using Settlement.ResourceInfos.MapperFactory;

namespace Settlement.ResourceInfos.Services.Tennis;

public class TennisResourceNameService : IMapperService
{
    private readonly IRefDataService refDataService;

    public TennisResourceNameService()
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
        return resourceId == ResourceType.Final ? ResourceNameConstants.Match : $"Set {Convert.ToInt32(resourceId)}";
    }
}