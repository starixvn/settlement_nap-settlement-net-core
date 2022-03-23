using System.Collections.Generic;

namespace Settlement.Sportsbook.Aio.Constants
{
    public static class InputType
    {
        public const int HomeAway = 0;
        public const int CaughtOrNot = 1;
        public const int SingleScore = 2;
        public const int CoupleScores = 3;
        public const int OneToSix = 4;
        public const int PlayerSelect = 5;
        public const int PlayerMultipleSelect = 6;
        public const int DismissalMethod = 7;
        public const int YesNo = 8;
        public const int ScoreWithLabel = 9;

        public static List<int> HomeAwayGroup => new List<int>
        {
            9401, 9400, 9442, 9443
        };

        public static List<int> CaughtOrNotGroup => new List<int>
        {
            9434, 9435
        };

        public static List<int> CoupleScoresGroup => new List<int>
        {
            9449, 9615, 9651, 9446, 9447, 9449, 9451
        };

        public static List<int> OneToSixGroup => new List<int>
        {
            9490, 9491
        };

        public static List<int> PlayerSelectGroup = new List<int>
        {
            9662, 9663
        };

        public static List<int> PlayerMultipleSelectGroup = new List<int>
        {
            9668, 9650, 9672, 9656, 9671, 9651, 9675, 9657
        };

        public static List<int> DismissalMethodGroup = new List<int>
        {
            9636, 9637
        };

        public static List<int> YesNoGroup = new List<int>
        {
            9624, 9630, 9625, 9631
        };

        public static List<int> ScoreWithLabelGroup => new List<int>
        {
            9680, 9676, 9730, 9736, 9690, 9686, 9731, 9737
        };
    }
}