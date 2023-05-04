using Settlement.Core.Constants;
using Settlement.ResourceName.Constants;
using Settlement.ResourceName.MapperFactory;

namespace Settlement.ResourceName.Services.Others;

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