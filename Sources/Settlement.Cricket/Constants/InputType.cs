using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Constants
{
    public static class InputType
    {
        public const int HomeAway = 0;
        public const int CaughtOrNot = 1;
        public const int SingleScore = 2;
        public const int CoupleScores = 3;
        public const int OneToSix = 4;

        public static List<int> HomeAwayGroup => new List<int>
        {
            9401, 9400,
        };

        public static List<int> CaughtOrNotGroup => new List<int>
        {
            94341, 94351, 94342, 94352
        };

        public static List<int> CoupleScoresGroup => new List<int>
        {
            9449
        };

        public static List<int> OneToSixGroup => new List<int>
        {
            94901, 94911, 94902, 94912
        };
    }
}
