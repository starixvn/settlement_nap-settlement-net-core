using Settlement.BetTypeName.Constants;

namespace Settlement.BetTypeName.MapperFactory;

public static class MapperServiceDictionary
{
    public static Dictionary<string, Type> MapperServices => new()
    {
        { KeyConstants.BadmintonKey, typeof(Services.Badminton.BadmintonBetTypeNameService) },
        { KeyConstants.BasketballKey, typeof(Services.BasketBall.BasketballBetTypeNameService) },
        { KeyConstants.CricketKey, typeof(Services.Cricket.CricketBetTypeNameService) },
        { KeyConstants.ESportsKey, typeof(Services.ESports.ESportsBetTypeNameService) },
        { KeyConstants.VolleyballKey, typeof(Services.Volleyball.VolleyballBetTypeNameService) }
    };
}