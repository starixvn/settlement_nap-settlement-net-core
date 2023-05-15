using Settlement.Core.Constants;
using Settlement.ResourceInfos.Constants;
using Settlement.ResourceInfos.MapperFactory;

namespace Settlement.ResourceInfos.Services.Badminton;

public class BadmintonResourceNameService : IMapperService
{
    private const int BetTypeCharacter = 3;

    private const int MaxLengthResourceId = 7;

    public (string, string) GetResourceName(string resourceId, int sportType)
    {
        if (resourceId.Length < MaxLengthResourceId)
        {
            return (resourceId, GetResourceMain(resourceId));
        }
        var betType = resourceId[..BetTypeCharacter];
        var gameX = resourceId.Substring(4, 1);
        var pointChar = resourceId.Substring(5, 2);
        var point = Convert.ToInt32(pointChar);
        var betTypeConvert = Convert.ToInt32(betType);

        var resourceName = betTypeConvert == BetType.BadmintonBetType.MapGameRacePoint ? $"Game {gameX} Race to {point} Points" : $"Game {gameX} Point {point} Winner";
        return (betType, resourceName);
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
                    return $"Game {gameNumber}";
                }
        }
    }
}