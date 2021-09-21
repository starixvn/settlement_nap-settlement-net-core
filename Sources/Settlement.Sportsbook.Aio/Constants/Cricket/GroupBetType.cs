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
            9401, 9400, 9442, 9443
        };

        public static List<int> FirstInnsHome => new List<int>
        {
            94841, 94901, 94221, 94101, 94281, 94341, 94541, 94601
        };

        public static List<int> FirstInnsAway => new List<int>
        {
            94851, 94911, 94231, 94111, 94291, 94351, 94551, 94611
        };

        public static List<int> SecondInnsHome => new List<int>
        {
            94842, 94902, 94222, 94102, 94282, 94342, 94542, 94602
        };

        public static List<int> SecondInnsAway => new List<int>
        {
            94852, 94912, 94232, 94112, 94292, 94352, 94552, 94612
        };

        public static List<int> MatchBetType => new List<int>
        {
            9446, 9447, 9449, 9450, 9452, 9453
        };

        public static List<int> IncludedOvers => new List<int>
        {
            94841, 94101, 94281, 94341, 94851, 94111, 94291, 94351, 94842, 94102,
            94282, 94342, 94852, 94112, 94292, 94352
        };

        public static List<int> IncludedOversAndBalls => new List<int>
        {
            94901, 94221, 94911, 94231, 94902, 94222, 94912, 94232,
        };
    }
}