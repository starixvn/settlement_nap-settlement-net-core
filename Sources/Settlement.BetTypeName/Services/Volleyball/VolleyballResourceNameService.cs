using Settlement.Core.Constants;
using Settlement.ResourceName.Constants;
using Settlement.ResourceName.MapperFactory;

namespace Settlement.ResourceName.Services.Volleyball;

public class VolleyballResourceNameService : IMapperService
{
    private const int BetTypeLength = 4;

    private const int SetPosition = 4;
    private const int PointPosition = 6;
    private const int VariableLength = 2;
    private const int ResourceMainLength = 2;

    public string GetResourceName(string resourceId)
    {
        if (resourceId.Length == ResourceMainLength || resourceId?.IndexOf("01") == 0)
        {
            return GetResourceMain(resourceId);
        }
        var betType = Convert.ToInt32(resourceId[..BetTypeLength]);
        var betTypeName = BetType.VolleyballBetTypeNames.ContainsKey(betType) ? BetType.VolleyballBetTypeNames[betType] : string.Empty;
        var set = SplitBetType(resourceId, SetPosition, VariableLength);
        var point = SplitBetType(resourceId, PointPosition, VariableLength);

        return string.Format(betTypeName, set, point);
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