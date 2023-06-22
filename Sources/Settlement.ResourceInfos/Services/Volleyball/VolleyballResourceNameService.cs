using Settlement.Core.Constants;
using Settlement.ResourceInfos.Constants;
using Settlement.ResourceInfos.MapperFactory;

namespace Settlement.ResourceInfos.Services.Volleyball;

public class VolleyballResourceNameService : IMapperService
{
    private const int BetTypeLength = 4;

    private const int SetPosition = 4;
    private const int PointPosition = 6;
    private const int VariableLength = 2;
    private const int ResourceMainLength = 2;

    public (string, string) GetResourceName(string resourceId, int sportType)
    {
        if (resourceId.Length == ResourceMainLength || resourceId?.IndexOf("01") == 0)
        {
            return (resourceId, GetResourceMain(resourceId));
        }
        var betType = Convert.ToInt32(resourceId[..BetTypeLength]);
        var betTypeName = BetType.VolleyballBetTypeNames.TryGetValue(betType, out var name) ? name : string.Empty;
        var set = SplitBetType(resourceId, SetPosition, VariableLength);
        var point = SplitBetType(resourceId, PointPosition, VariableLength);

        return (betType.ToString(), string.Format(betTypeName, set, point));
    }

    private static int SplitBetType(string resourceId, int startIndex, int length)
    {
        return resourceId.Length >= startIndex + length ? Convert.ToInt32(resourceId.Substring(startIndex, length)) : 0;
    }

    private static string GetResourceMain(string resourceId)
    {
        switch (resourceId)
        {
            case ResourceType.Final:
                return ResourceNameConstants.Match;

            case ResourceType.Halftime:
                return ResourceNameConstants.TotalPoints;

            default:
                {
                    var gameNumber = resourceId.Substring(3, 1);
                    return $"Set {gameNumber}";
                }
        }
    }
}