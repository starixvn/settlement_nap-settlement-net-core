using Settlement.Core.Constants;

namespace Settlement.Sportsbook.OtherSports.Constants;

public static class GroupSport
{
    public static List<int> FootBall => [SportType.Football, SportType.Rugby, SportType.NetBall];

    public static List<int> Hockey => [SportType.IceHockey, SportType.FieldHockey];

    public static List<int> Squash => [SportType.Squash, SportType.SepakTakraw];
}