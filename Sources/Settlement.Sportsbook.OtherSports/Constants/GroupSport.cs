using Settlement.Core.Constants;

namespace Settlement.Sportsbook.OtherSports.Constants;

public static class GroupSport
{
    public static List<int> FootBall => [SportType.Football, SportType.Rugby, SportType.NetBall];

    public static List<int> Hockey => [SportType.IceHockey, SportType.FieldHockey];

    public static List<int> Squash => [SportType.Squash, SportType.SepakTakraw];

    public static List<int> OnlyFullTime => [SportType.SnookerPool, SportType.Golf, SportType.Motorsports,
        SportType.Dart, SportType.Winter,
        SportType.Cycling, SportType.Fencing, SportType.Judo, SportType.ModernPentathlon, SportType.Rowing, SportType.Sailing,
        SportType.Shooting, SportType.Taekwondo, SportType.Triathlon, SportType.Wrestling, SportType.MuayThai, SportType.BeachSoccer,
        SportType.Poker, SportType.Chess, SportType.Olympic, SportType.Finance, SportType.AlpineSkiing,
        SportType.Biathlon, SportType.Curling, SportType.FigureSkating, SportType.FreestyleSkiing,
        SportType.Luge, SportType.Skeleton, SportType.SkiJumping, SportType.SpeedSkating,
        SportType.Archery, SportType.Athletics, SportType.Boxing,
        SportType.Canoeing, SportType.Diving, SportType.Entertainment, SportType.Equestrian, SportType.Gymnastics,
        SportType.Politics, SportType.Swimming, SportType.Weightlifting];
}