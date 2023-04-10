using Settlement.Core.Constants;

namespace Settlement.Sportsbook.OtherSports.Constants;

public static class GroupSport
{
    public static List<int> FootBall => new()
    {
        SportType.Football, SportType.Rugby, SportType.NetBall
    };

    public static List<int> Hockey => new()
    {
        SportType.IceHockey, SportType.FieldHockey
    };

    public static List<int> Squash => new()
    {
        SportType.Squash, SportType.SepakTakraw
    };
}