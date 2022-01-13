using System.Collections.Generic;

namespace Settlement.Core.Constants
{
    public static class BetType
    {
        #region Cricket early bet types

        public static Dictionary<int, string> CricketBetTypeNames => new Dictionary<int, string>
        {
            {9400, "Super Over Winner" },
            {9401, "Toss Winner" },
            {9442, "Highest Opening Partnership" },
            {9443, "Highest Score in Over 1" },

            {9446, "Match Fours" },
            {9447, "Match Sixes" },
            {9449, "Match Wickets" },
            {9450, "Match Extras" },
            {9452, "Highest Individual Score" },
            {9453, "Highest Over Score" },

            {94841, "1st Inns Over {0} Exact Runs" },
            {94851, "1st Inns Over {0} Exact Runs" },
            {94901, "1st Inns Over {0} Ball {1} Exact Runs" },
            {94911, "1st Inns Over {0} Ball {1} Exact Runs" },
            {94221, "1st Inns Over {0} Ball {1}" },
            {94231, "1st Inns Over {0} Ball {1}" },
            {94101, "1st Inns Group 1-{0}" },
            {94111, "1st Inns Group 1-{0}" },
            {94281, "1st Inns Fall of Wicket {0}" },
            {94291, "1st Inns Fall of Wicket {0}" },
            {94341, "1st Inns Wicket {0} Method of Dismissal" },
            {94351, "1st Inns Wicket {0} Method of Dismissal" },
            {94541, "1st Inns Fours" },
            {94551, "1st Inns Fours" },
            {94601, "1st Inns Sixes" },
            {94611, "1st Inns Sixes" },

            {94842, "2nd Inns Over {0} Exact Runs" },
            {94852, "2nd Inns Over {0} Exact Runs" },
            {94902, "2nd Inns Over {0} Ball {1} Exact Runs" },
            {94912, "2nd Inns Over {0} Ball {1} Exact Runs" },
            {94222, "2nd Inns Over {0} Ball {1}" },
            {94232, "2nd Inns Over {0} Ball {1}" },
            {94102, "2nd Inns Group 1-{0}" },
            {94112, "2nd Inns Group 1-{0}" },
            {94282, "2nd Inns Fall of Wicket {0}" },
            {94292, "2nd Inns Fall of Wicket {0}" },
            {94342, "2nd Inns Wicket {0} Method of Dismissal" },
            {94352, "2nd Inns Wicket {0} Method of Dismissal" },
            {94542, "2nd Inns Fours" },
            {94552, "2nd Inns Fours" },
            {94602, "2nd Inns Sixes" },
            {94612, "2nd Inns Sixes" },

        };

        #endregion Cricket early bet types

        #region E-Sport early bet types

        public static class ESportBetType
        {
            public const int MapKillsScore = 9002;

            public const int MapTowersScore = 9008;

            public const int MapRoshansScore = 9012;

            public const int MapBarracksScore = 9018;

            public const int MapTurretsScore = 9024;

            public const int MapDragonsScore = 9028;

            public const int MapBaronsScore = 9034;

            public const int MapInhibitorsScore = 9040;

            public const int MapTyrantsScore = 9046;

            public const int MapLordsScore = 9052;

            public const int MapDuration = 9058;

            public const int MapRoundsScore = 9059;

            public const int MapRoundsScoreOvertime = 9074;

            public const int MapTotalFirstKills = 9065;

            public const int MapClutchesScore = 9066;

            public const int MapRoundWinner = 9068;

            public const int MapRoundTotalKills = 9069;

            public const int MapGameRacePoint = 712;

            public const int MapGamePointWinner = 713;

        }

        #endregion E-Sport early bet types

        #region Badminton bet types
        public static class BadmintonBetType
        {
            public const int MapGameRacePoint = 712;
        }
        #endregion Badminton bet types
    }
}