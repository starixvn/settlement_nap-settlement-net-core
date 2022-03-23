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
            {9442, "1st Inns Highest Opening Partnership" },
            {9443, "1st Inns Highest Score in Over 1" },

            {9446, "Match Fours" },
            {9447, "Match Sixes" },
            {9449, "Match Wickets" },
            {9450, "Match Extras" },
            {9452, "Highest Individual Score" },
            {9453, "Highest Over Score" },
            {9615, "Match Run Outs" },
            {9451, "Match Dot Ball" },

            {9484, "{0} Inns Over {1} Runs" },
            {9485, "{0} Inns Over {1} Runs" },
            {9490, "{0} Inns Over {1} Ball {2} Exact Runs" },
            {9491, "{0} Inns Over {1} Ball {2} Exact Runs" },
            {9422, "{0} Inns Over {1} Ball {2}" },
            {9423, "{0} Inns Over {1} Ball {2}" },
            {9410, "{0} Inns Group 1-{1}" },
            {9411, "{0} Inns Group 1-{1}" },
            {9428, "{0} Inns Fall of Wicket {1}" },
            {9429, "{0} Inns Fall of Wicket {1}" },
            {9434, "{0} Inns Wicket {1} Method of Dismissal (2-way)" },
            {9435, "{0} Inns Wicket {1} Method of Dismissal (2-way)" },
            {9454, "{0} Inns Fours" },
            {9455, "{0} Inns Fours" },
            {9460, "{0} Inns Sixes" },
            {9461, "{0} Inns Sixes" },
            {9708, "{0} Inns Highest Individual Score" },
            {9709, "{0} Inns Highest Over Score" },

            {9680, "{0} Inns Batsman Runs" },
            {9690, "{0} Inns Batsman Runs" },
            {9662, "{0} Inns Next Man Out" },
            {9663, "{0} Inns Next Man Out" },
            {9676, "{0} Inns Player Runs" },
            {9686, "{0} Inns Player Runs" },
            {9668, "{0} Inns Prematch Top Batsman" },
            {9671, "{0} Inns Prematch Top Batsman" },
            {9650, "{0} Inns Top Batsman" },
            {9651, "{0} Inns Top Batsman" },
            {9672, "{0} Inns Prematch Top Bowler" },
            {9675, "{0} Inns Prematch Top Bowler" },
            {9656, "{0} Inns Top Bowler" },
            {9657, "{0} Inns Top Bowler" },
            {9636, "{0} Inns Wicket {1} Method of Dismissal (6-way)" },
            {9637, "{0} Inns Wicket {1} Method of Dismissal (6-way)" },
            {9616, "{0} Inns Over {1} Delivery {2} Runs" },
            {9617, "{0} Inns Over {1} Delivery {2} Runs" },
            {9624, "{0} Inns Over {1} Has Boundary Four?" },
            {9625, "{0} Inns Over {1} Has Boundary Four?" },
            {9630, "{0} Inns Over {1} Has Boundary Six?" },
            {9631, "{0} Inns Over {1} Has Boundary Six?" },
            {9730, "{0} Inns Player Sixes" },
            {9731, "{0} Inns Player Sixes" },
            {9736, "{0} Inns Player Fours" },
            {9737, "{0} Inns Player Fours" },
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

            public const int MapFirstToKillTime = 9089;

            public const int MapFirstBloodTime = 9090;

            public const int MapTotalKillTenMin = 9091;

            public const int MapTotalKillTwentyMin = 9093;

            public const int MapHomeTotalKill = 9099;

            public const int MapSpecificKill = 9101;

            public const int MapMostTurretsDestroyedLane = 9113;

            public const int MapFirstTurretLocation = 9114;

            public const int MapTotalGold = 9115;

            public const int MapFirstTyrantTime = 9121;

            public const int MapFirstDarkTyrant = 9122;

            public const int MapFirstOverlordTime = 9123;

            public const int MapStormDragonKilled = 9124;

            public const int MapFirstHerald = 9125;

            public const int MapFirstHeraldTime = 9126;

            public const int MapFirstBaronTime = 9127;

            public const int MapNumberOfPlayersFirstBaronBuffed = 9128;

            public const int MapFirstInhibitorTime = 9129;

            public const int MapFirstInhibitorLocation = 9130;

            public const int MapFirstDragonTime = 9131;

            public const int MapElderDragonKilled = 9132;

            public const int MapFirstAegisSnatched = 9133;

            public const int MapFirstTowerTime = 9134;

            public const int MapFirstTowerLocation = 9135;

            public const int MapFirstRoshanTime = 9136;

            public const int MapFirstBarrackTime = 9137;

            public const int MapFirstBarrackLocation = 9138;

            public const int MapTotalBombDetonation = 9139;

            public const int MapTotalBombDefuses = 9140;

            public const int MapLaneWithMostTurretsDestroyed = 9141;

            public const int MapFirstTurretLocationKOG = 9142;
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