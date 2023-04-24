using Settlement.BetTypeName.MapperFactory;
using Settlement.Core.Constants;

namespace Settlement.BetTypeName.Services.Badminton;

public class BadmintonBetTypeNameService : IMapperService
{
    private const int BetTypeCharacter = 3;

    public string GetResourceName(string resourceId)
    {
        var betType = resourceId[..BetTypeCharacter]; ;
        var gameX = resourceId.Substring(4, 1);
        var pointChar = resourceId.Substring(5, 2);
        var point = Convert.ToInt32(pointChar);
        var betTypeConvert = Convert.ToInt32(betType);

        return betTypeConvert == BetType.BadmintonBetType.MapGameRacePoint ? $"Game {gameX} Race to {point} Points" : $"Game {gameX} Point {point} Winner";
    }
}