using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Core.Constants
{
    public static class BetType
    {
        #region Cricket early bet types
        public static Dictionary<int, string> CricketBetTypeNames => new Dictionary<int, string>
        {
            {9400, "Super Over Winner" },
            {9401, "Toss Winner" },

            {9446, "Match Fours" },
            {9447, "Match Sixes" },
            {9449, "Match Wickets" },
            {9450, "Match Extras" },
            {9452, "Highest Individual Score" },
            {9453, "Highest Over Score" },

            {94841, "1st Innings Over XXX Exact Runs - HOME_TEAM" },
            {94851, "1st Innings Over XXX Exact Runs - TEAM_AWAY" },
            {94901, "1st Innings Over XXX Ball YYY Exact Runs - HOME_TEAM" },
            {94911, "1st Innings Over XXX Ball YYY Exact Runs - AWAY_TEAM" },
            {94221, "1st Inns Over XXX Ball YYY - HOME_TEAM" },
            {94231, "1st Inns Over XXX Ball YYY - AWAY_TEAM" },
            {94101, "1st Innings Group 1-XXX - HOME_TEAM" },
            {94111, "1st Innings Group 1-XXX - AWAY_TEAM" },
            {94281, "1st Innings Fall of Wicket XXX - HOME_TEAM" },
            {94291, "1st Innings Fall of Wicket XXX - AWAY_TEAM" },
            {94341, "1st Innings Wicket XXX Method of Dismissal - HOME_TEAM" },
            {94351, "1st Innings Wicket XXX Method of Dismissal - AWAY_TEAM" },
            {94541, "1st Innings Fours - HOME_TEAM" },
            {94551, "1st Innings Fours - AWAY_TEAM" },
            {94601, "1st Innings Sixes - HOME_TEAM" },
            {94611, "1st Innings Sixes - AWAY_TEAM" },

            {94842, "2nd Innings Over XXX Exact Runs - HOME_TEAM" },
            {94852, "2nd Innings Over XXX Exact Runs - TEAM_AWAY" },
            {94902, "2nd Innings Over XXX Ball YYY Exact Runs - HOME_TEAM" },
            {94912, "2nd Innings Over XXX Ball YYY Exact Runs - AWAY_TEAM" },
            {94222, "2nd Inns Over XXX Ball YYY - HOME_TEAM" },
            {94232, "2nd Inns Over XXX Ball YYY - AWAY_TEAM" },
            {94102, "2nd Innings Group 1-XXX - HOME_TEAM" },
            {94112, "2nd Innings Group 1-XXX - AWAY_TEAM" },
            {94282, "2nd Innings Fall of Wicket XXX - HOME_TEAM" },
            {94292, "2nd Innings Fall of Wicket XXX - AWAY_TEAM" },
            {94342, "2nd Innings Wicket XXX Method of Dismissal - HOME_TEAM" },
            {94352, "2nd Innings Wicket XXX Method of Dismissal - AWAY_TEAM" },
            {94542, "2nd Innings Fours - HOME_TEAM" },
            {94552, "2nd Innings Fours - AWAY_TEAM" },
            {94602, "2nd Innings Sixes - HOME_TEAM" },
            {94612, "2nd Innings Sixes - AWAY_TEAM" },
        };
        #endregion
    }
}
