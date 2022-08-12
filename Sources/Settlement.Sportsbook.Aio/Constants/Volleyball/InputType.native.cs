using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Constants.Volleyball
{
    public static class InputType
    {
        public const int HomeAwayNoneId = 0;
        public const int CoupleScoreId = 1;
        public const int HomeAwayId = 2;
        public const int YesNoId = 3;

        public static List<int> CoupleScore => new List<int>
        {
            3903, 3915
        };

        public static List<int> HomeAwayNone => new List<int>
        {
            3909
        };

        public static List<int> HomeAway => new List<int>
        {
            3901
        };

        public static List<int> YesNo => new List<int>
        {
            3914
        };
    }
}
