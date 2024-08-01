using Settlement.ResourceInfos.Constants;

namespace Settlement.ResourceInfos.MapperFactory;

public static class MapperServiceDictionary
{
    public static Dictionary<string, Type> MapperServices => new()
    {
        { KeyConstants.BadmintonKey, typeof(Services.Badminton.BadmintonResourceNameService) },
        { KeyConstants.BasketballKey, typeof(Services.BasketBall.BasketballResourceNameService) },
        { KeyConstants.CricketKey, typeof(Services.Cricket.CricketResourceNameService) },
        { KeyConstants.ESportsKey, typeof(Services.ESports.ESportsResourceNameService) },
        { KeyConstants.VolleyballKey, typeof(Services.Volleyball.VolleyballResourceNameService) },
        { KeyConstants.SoccerKey, typeof(Services.Soccer.SoccerResourceNameService)},
        { KeyConstants.GameTotalKey, typeof(Services.Others.GameTotalResourceName)},
        { KeyConstants.OtherKey, typeof(Services.Others.OtherResourceName)},
        { KeyConstants.TennisKey, typeof(Services.Tennis.TennisResourceNameService)},
        { KeyConstants.BaseballKey, typeof(Services.BasketBall.BaseballResourceNameService) }
    };
}