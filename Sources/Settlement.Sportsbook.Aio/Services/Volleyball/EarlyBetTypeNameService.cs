using Settlement.Core.Constants;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Volleyball;

public interface IEarlyBetTypeNameService
{
    void SetBetTypeName(ResultDetail resultDetail, int betTypeId);
}

public class EarlyBetTypeNameServiceImp : IEarlyBetTypeNameService
{
    public void SetBetTypeName(ResultDetail resultDetail, int betTypeId)
    {
        const int setPosition = 4;
        const int pointPosition = 6;
        const int variableLength = 2;
        var betTypeName = BetType.VolleyballBetTypeNames.ContainsKey(betTypeId) ? BetType.VolleyballBetTypeNames[betTypeId] : string.Empty;
        var set = SplitBetType(resultDetail.ResourceId, setPosition, variableLength);
        var point = SplitBetType(resultDetail.ResourceId, pointPosition, variableLength);

        resultDetail.BetTypeName = string.Format(betTypeName, set, point);
    }

    private static int SplitBetType(string resourceId, int startIndex, int length)
    {
        return resourceId.Length >= startIndex + length ? Convert.ToInt32(resourceId.Substring(startIndex, length)) : 0;
    }
}