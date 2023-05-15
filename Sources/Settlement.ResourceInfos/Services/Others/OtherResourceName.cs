using Settlement.Core.Constants;
using Settlement.ResourceInfos.Constants;
using Settlement.ResourceInfos.MapperFactory;

namespace Settlement.ResourceInfos.Services.Others;

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
            _ => QuarterPeriod(resourceId, sportType)
        };

        return (resourceId, resourceName);
    }

    private string QuarterPeriod(string resourceId, int sportType)
    {
        if (sportQuarter.IndexOf(sportType) > -1)
        {
            return $"{resourceId}Q";
        }

        return sportPeriod.IndexOf(sportType) > -1 ? $"{resourceId}P" : resourceId;
    }
}