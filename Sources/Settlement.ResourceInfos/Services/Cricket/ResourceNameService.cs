using Settlement.Core.Constants;
using Settlement.ResourceInfos.Constants;

namespace Settlement.ResourceInfos.Services.Cricket;

public interface IResourceNameService
{
    string GetNonInnsBetTypeName(int betTypeId);

    string GetInnsBetTypeName(int betTypeId, string resourceId);
}

public class ResourceNameService : IResourceNameService
{
    public string GetNonInnsBetTypeName(int betTypeId)
    {
        return BetType.CricketBetTypeNames.TryGetValue(betTypeId, out var name) ? name : string.Empty;
    }

    public string GetInnsBetTypeName(int betTypeId, string resourceId)
    {
        var betTypeName = GetNonInnsBetTypeName(betTypeId);

        if (string.IsNullOrWhiteSpace(betTypeName))
        {
            return string.Empty;
        }

        const int overPosition = 5;
        const int overLength = 3;
        const int ballPosition = 8;
        const int ballLength = 2;
        const int numberOfInnsPosition = 4;
        const int numberOfInnsLength = 1;
        var numberOfInns = SplitBetType(resourceId, numberOfInnsPosition, numberOfInnsLength);
        var innsOrdinal = numberOfInns == 1 ? "1st" : "2nd";

        if (CricketConstants.IncludedOvers.Contains(betTypeId))
        {
            var betTypeOvers = SplitBetType(resourceId, overPosition, overLength);
            return string.Format(betTypeName, innsOrdinal, betTypeOvers);
        }

        if (CricketConstants.IncludedOversAndBalls.Contains(betTypeId))
        {
            var betTypeOvers = SplitBetType(resourceId, overPosition, overLength);
            var betTypeBalls = SplitBetType(resourceId, ballPosition, ballLength);
            return string.Format(betTypeName, innsOrdinal, betTypeOvers, betTypeBalls);
        }
        return string.Format(betTypeName, innsOrdinal);
    }

    private static int SplitBetType(string resourceId, int startIndex, int length)
    {
        return Convert.ToInt32(resourceId.Substring(startIndex, length));
    }
}