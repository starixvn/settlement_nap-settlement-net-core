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
        { KeyConstants.GameTotalKey, typeof(Services.Others.GameTotalResourceName)},
        { KeyConstants.OtherKey, typeof(Services.Others.OtherResourceName)},
    };
}