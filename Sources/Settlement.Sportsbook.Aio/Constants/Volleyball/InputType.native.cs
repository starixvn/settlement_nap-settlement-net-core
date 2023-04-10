namespace Settlement.Sportsbook.Aio.Constants.Volleyball;

public static class InputType
{
    public const int HomeAwayNoneId = 0;
    public const int CoupleScoreId = 1;
    public const int HomeAwayId = 2;
    public const int YesNoId = 3;

    public static List<int> CoupleScore => new()
    {
            3903, 3915
        };

    public static List<int> HomeAwayNone => new()
    {
            3909
        };

    public static List<int> HomeAway => new()
    {
            3901
        };

    public static List<int> YesNo => new()
    {
            3914
        };
}