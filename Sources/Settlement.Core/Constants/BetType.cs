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

            {94841, "1st Innings Over {0} Exact Runs" },
            {94851, "1st Innings Over {0} Exact Runs" },
            {94901, "1st Innings Over {0} Ball {1} Exact Runs" },
            {94911, "1st Innings Over {0} Ball {1} Exact Runs" },
            {94221, "1st Inns Over {0} Ball {1}" },
            {94231, "1st Inns Over {0} Ball {1}" },
            {94101, "1st Innings Group 1-{0}" },
            {94111, "1st Innings Group 1-{0}" },
            {94281, "1st Innings Fall of Wicket {0}" },
            {94291, "1st Innings Fall of Wicket {0}" },
            {94341, "1st Innings Wicket {0} Method of Dismissal" },
            {94351, "1st Innings Wicket {0} Method of Dismissal" },
            {94541, "1st Innings Fours" },
            {94551, "1st Innings Fours" },
            {94601, "1st Innings Sixes" },
            {94611, "1st Innings Sixes" },

            {94842, "2nd Innings Over {0} Exact Runs" },
            {94852, "2nd Innings Over {0} Exact Runs" },
            {94902, "2nd Innings Over {0} Ball {1} Exact Runs" },
            {94912, "2nd Innings Over {0} Ball {1} Exact Runs" },
            {94222, "2nd Inns Over {0} Ball {1}" },
            {94232, "2nd Inns Over {0} Ball {1}" },
            {94102, "2nd Innings Group 1-{0}" },
            {94112, "2nd Innings Group 1-{0}" },
            {94282, "2nd Innings Fall of Wicket {0}" },
            {94292, "2nd Innings Fall of Wicket {0}" },
            {94342, "2nd Innings Wicket {0} Method of Dismissal" },
            {94352, "2nd Innings Wicket {0} Method of Dismissal" },
            {94542, "2nd Innings Fours" },
            {94552, "2nd Innings Fours" },
            {94602, "2nd Innings Sixes" },
            {94612, "2nd Innings Sixes" },
        };
        #endregion
    }
}
