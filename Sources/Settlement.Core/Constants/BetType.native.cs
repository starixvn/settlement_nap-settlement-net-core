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

            public const int MapFirstToKillTimeOU = 9089;

            public const int MapFirstBloodTimeOU = 9090;

            public const int MapTotalKillTenMinHDP = 9091;

            public const int MapTotalKillTenMinOU = 9092;

            public const int MapTotalKillTwentyMinHDP = 9093;

            public const int MapTotalKillTwentyMinOU = 9094;

            public const int MapHomeTotalKillTenMinOU = 9095;

            public const int MapAwayTotalKillTenMinOU = 9096;

            public const int MapHomeTotalKillTwentyMinOU = 9097;

            public const int MapAwayTotalKillTwentyMinOU = 9098;

            public const int MapHomeTotalKillOU = 9099;

            public const int MapAwayTotalKillOU = 9100;

            public const int MapFirstKill = 9101;

            public const int MapSecondKill = 9102;

            public const int MapThirdKill = 9103;

            public const int MapFourthKill = 9104;

            public const int MapFifthKill = 9105;

            public const int MapSixthKill = 9106;

            public const int MapSeventhKill = 9107;

            public const int MapEighthKill = 9108;

            public const int MapNinthKill = 9109;

            public const int MapTenthKill = 9110;

            public const int MapFifteenthKill = 9111;

            public const int MapTwentiethKill = 9112;

            public const int MapFirstTurretTimeOU = 9113;

            public const int MapFirstTurretLocation = 9114;

            public const int MapTotalGoldMoneyline = 9115;

            public const int MapTotalGoldHDP = 9116;

            public const int MapTotalGoldOU = 9117;

            public const int MapHomeTotalGoldOU = 9118;

            public const int MapAwayTotalGoldOU = 9119;

            public const int MapTotalGoldOE = 9120;

            public const int MapFirstTyrantTimeOU = 9121;

            public const int MapFirstDarkTyrant = 9122;

            public const int MapFirstOverlordTimeOU = 9123;

            public const int MapStormDragonKilled = 9124;

            public const int MapFirstHerald = 9125;

            public const int MapFirstHeraldTimeOU = 9126;

            public const int MapFirstBaronTimeOU = 9127;

            public const int MapNumberOfPlayersFirstBaronBuffedOU = 9128;

            public const int MapFirstInhibitorTimeOU = 9129;

            public const int MapFirstInhibitorLocation = 9130;

            public const int MapFirstDragonTimeOU = 9131;

            public const int MapFirstElderDragon = 9132;

            public const int MapFirstAegisSnatched = 9133;

            public const int MapFirstTowerTimeOU = 9134;

            public const int MapFirstTowerLocation = 9135;

            public const int MapFirstRoshanTimeOU = 9136;

            public const int MapFirstBarrackTimeOU = 9137;

            public const int MapFirstBarrackLocation = 9138;

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