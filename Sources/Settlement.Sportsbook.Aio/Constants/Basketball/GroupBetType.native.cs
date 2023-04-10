namespace Settlement.Sportsbook.Aio.Constants.Basketball;

public static class GroupBetType
{
    public const string FirstHalfName = "1st Half";
    public const string SecondHalfName = "2nd Half";
    public const string QuarterOneName = "Quarter 1";
    public const string QuarterTwoName = "Quarter 2";
    public const string QuarterThreeName = "Quarter 3";
    public const string QuarterFourName = "Quarter 4";
    public const string OtherName = "Other";
    public const int OtherId = 0;
    public const int QuarterOneId = 1;
    public const int QuarterTwoId = 2;
    public const int FirstHalfId = 3;
    public const int QuarterThreeId = 4;
    public const int QuarterFourId = 5;
    public const int SecondHalfId = 6;

    public static List<int> Other => new()
    {
            605, 604
        };

    public static List<int> FirstHalf => new()
    {
            606
        };

    public static List<int> SecondHalf => new()
    {
            607
        };

    public static List<int> QuarterOne => new()
    {
            61701, 61301
        };

    public static List<int> QuarterTwo => new()
    {
            61702, 61302
        };

    public static List<int> QuarterThree => new()
    {
            61703, 61303
        };

    public static List<int> QuarterFour => new()
    {
            61704, 61304
        };
}