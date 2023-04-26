using Settlement.Core.Constants;

namespace Settlement.ResourceName.Constants;

public static class KeyConstants
{
    public const string BadmintonKey = "BadmintonKey";

    public const string BasketballKey = "BasketballKey";

    public const string CricketKey = "CricketKey";

    public const string ESportsKey = "ESportsKey";

    public const string VolleyballKey = "VolleyballKey";

    public const string GameTotalKey = "GameTotalKey";

    public static Dictionary<int, string> KeyDictionary => new()
    {
        {SportType.Badminton, BadmintonKey},
        {SportType.BasketBall, BasketballKey},
        {SportType.Cricket, CricketKey},
        {SportType.ESports, ESportsKey},
        {SportType.VolleyBall, VolleyballKey},
        {SportType.BeachVolleyball, GameTotalKey},
        {SportType.Squash, GameTotalKey},
        {SportType.SepakTakraw, GameTotalKey},
    };
}