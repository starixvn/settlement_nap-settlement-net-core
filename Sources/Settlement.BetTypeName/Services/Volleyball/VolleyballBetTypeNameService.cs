using Settlement.BetTypeName.MapperFactory;
using Settlement.Core.Constants;

namespace Settlement.BetTypeName.Services.Volleyball;

public class VolleyballBetTypeNameService : IMapperService
{
    private const int BetTypeLength = 4;

    private const int SetPosition = 4;
    private const int PointPosition = 6;
    private const int VariableLength = 2;

    public string GetResourceName(string resourceId)
    {
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
}