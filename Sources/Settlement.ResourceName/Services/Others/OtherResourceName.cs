using Settlement.Core.Constants;
using Settlement.ResourceName.Constants;
using Settlement.ResourceName.MapperFactory;

namespace Settlement.ResourceName.Services.Others;

public class OtherResourceName : IMapperService
{
    private readonly List<int> sportQuarter = new() { SportType.Football, SportType.Rugby, SportType.NetBall };

    private readonly List<int> sportPeriod = new() { SportType.IceHockey, SportType.FieldHockey };

    public (string, string) GetResourceName(string resourceId, int sportType)
    {
        var resourceName = resourceId switch
        {
            ResourceType.Halftime => ResourceNameConstants.HalfTime,
            ResourceType.Final => ResourceNameConstants.Final,
            ResourceType.OverTime => sportType == SportType.BaseBall ? ResourceNameConstants.ExtraInning : ResourceNameConstants.OverTime,
            _ => sportQuarter.IndexOf(sportType) > -1 ? $"{resourceId}Q" :
                sportPeriod.IndexOf(sportType) > -1 ? $"{resourceId}P" : resourceId
        };

        return (resourceId, resourceName);
    }
}