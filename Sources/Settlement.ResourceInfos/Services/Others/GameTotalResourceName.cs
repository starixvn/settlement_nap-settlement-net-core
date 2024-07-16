using Settlement.Core.Constants;
using Settlement.ResourceInfos.Constants;
using Settlement.ResourceInfos.MapperFactory;

namespace Settlement.ResourceInfos.Services.Others;

public class GameTotalResourceName : IMapperService
{
    public (string, string) GetResourceName(string resourceId, int sportType)
    {
        var resourceName = resourceId switch
        {
            ResourceType.Final => ResourceNameConstants.TotalSets,
            ResourceType.Halftime => ResourceNameConstants.TotalPoints,
            _ => $"{resourceId[^1..]}S"
        };

        return (resourceId, resourceName);
    }
}