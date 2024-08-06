namespace Settlement.Sportsbook.Aio.Constants.Standard;

public static class InputType
{
    public const int CoupleScoreId = 1;

    public const int HomeAwayId = 2;

    public const int YesNoId = 3;

    public static List<int> CoupleScore => new()
    {
            8823, 8816
    };

    public static List<int> YesNo => new()
    {
        8815
    };
}