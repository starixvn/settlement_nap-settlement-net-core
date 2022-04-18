using System.Collections.Generic;
using Settlement.Core.Constants;

namespace Settlement.Sportsbook.OtherSports.Constants
{
    public static class GroupSport
    {
        public static List<int> FootBall => new List<int>
        {
            SportType.Football, SportType.Rugby, SportType.NetBall
        };

        public static List<int> Hockey => new List<int>
        {
             SportType.IceHockey, SportType.FieldHockey
        };
    }
}