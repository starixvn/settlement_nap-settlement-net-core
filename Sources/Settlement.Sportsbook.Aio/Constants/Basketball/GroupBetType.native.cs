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

    public static List<int> Other => [605, 604];

    public static List<int> FirstHalf => [606];

    public static List<int> SecondHalf => [607];

    public static List<int> QuarterOne => [61701, 61301];

    public static List<int> QuarterTwo => [61702, 61302];

    public static List<int> QuarterThree => [61703, 61303];

    public static List<int> QuarterFour => [61704, 61304];

    public static List<int> Player => [653, 654, 655, 685, 656, 657, 658, 686, 659, 660, 661, 687, 662, 663, 664, 688, 665, 666, 667, 668, 669, 670, 671, 672, 673, 674, 675, 676, 678, 677, 679, 680, 681, 682, 683, 684];

    public static List<string> TextBoxType => ["653", "656", "659", "662", "665", "667", "669", "671", "673", "674"];

    public static List<string> YesNoNoneType => ["675", "676", "678", "677", "679"];

    public static List<string> PlayerSelectionType => ["680", "681", "682", "683", "684"];

}