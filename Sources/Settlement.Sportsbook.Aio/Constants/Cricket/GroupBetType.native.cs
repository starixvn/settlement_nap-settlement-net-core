using System.Collections.Generic;

namespace Settlement.Sportsbook.Aio.Constants
{
    public static class GroupBetType
    {
        public const int MainId = 0;
        public const int OtherId = 1;
        public const int FirstInnsHomeId = 2;
        public const int FirstInnsAwayId = 3;
        public const int SecondInnsHomeId = 4;
        public const int SecondInnsAwayId = 5;
        public const int MatchBetTypeId = 6;
        public const string OtherName = "Other";
        public const string FirstInnsHomeName = "1st Innings - Home";
        public const string FirstInnsAwayName = "1st Innings - Away";
        public const string SecondInnsHomeName = "2nd Innings - Home";
        public const string SecondInnsAwayName = "2nd Innings - Away";
        public const string MatchBetTypeName = "Match";

        public static List<int> Other => new List<int>
        {
            9401, 9400, 9442, 9443, 9708, 9709
        };

        public static List<int> InnsHome => new List<int>
        {
            9484, 9490, 9422, 9410, 9428, 9434, 9454, 9460, 9680, 9662,
            9676, 9668, 9650, 9672, 9656, 9636, 9616, 9624, 9630, 9730, 9736
        };

        public static List<int> InnsAway => new List<int>
        {
            9485, 9491, 9423, 9411, 9429, 9435, 9455, 9461, 9690, 9663, 9686,
            9671, 9651, 9675, 9657, 9637, 9617, 9625, 9631, 9731, 9737
        };

        public static List<int> MatchBetType => new List<int>
        {
            9446, 9447, 9449, 9450, 9452, 9453, 9615, 9451
        };

        public static List<int> IncludedOvers => new List<int>
        {
            9484, 9410, 9428, 9434, 9485, 9411, 9429, 9435,
            9636, 9624, 9630, 9637, 9625, 9631
        };

        public static List<int> IncludedOversAndBalls => new List<int>
        {
            9490, 9422, 9491, 9423, 9616, 9617
        };

        public static List<int> IncludedPlayerName => new List<int>
        {
            9680, 9676, 9730, 9736, 9690, 9686, 9731, 9737
        };
    }
}