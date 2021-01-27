using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Constants
{
    public static class GroupBetType
    {
        public const int MainId = 0;
        public const int WinnerLoserId = 1;
        public const int ExactId = 2;
        public const int OverUnderId = 3;
        public const int OddEvenId = 4;
        public const int FancyId = 5;
        public const string WinnerLoserName = "Winner/Loser";
        public const string ExactName = "Exact";
        public const string OverUnderName = "Over/Under";
        public const string OddEvenName = "Odd/Even";
        public const string FancyName = "Fancy";

        public static List<int> WinnerLoserBetTypes = new List<int>
        {
            9401, 9400, 9540
        };

        public static List<int> ExactBetTypes = new List<int>
        {
            9434, 9435, 9436, 9437, 9438, 9439, 9484, 9485, 9490, 9491
        };

        public static List<int> OverUnderBetTypes = new List<int>
        {
            9410, 9411, 9412, 9413, 9414, 9415, 9416, 9417, 9418, 9419,
            9420, 9421, 9422, 9423, 9428, 9429, 9430, 9431, 9432, 9433,
            9446, 9447, 9449, 9450, 9452, 9453, 9454, 9455, 9460, 9461
        };

        public static List<int> OddEvenBetTypes = new List<int>
        {
            9502, 9503, 9504, 9505, 9506, 9507, 9508, 9509, 9510, 9511,
            9512, 9513, 9514, 9515, 9516, 9517, 9518, 9519, 9527, 9528,
            9530, 9532, 9533
        };

        public static List<int> FancyBetTypes = new List<int>
        {
            9547, 9548, 9549, 9550, 9551, 9552, 9553, 9554, 9555, 9556,
            9557, 9558, 9559, 9560, 9561, 9562, 9563, 9564, 9566, 9567,
            9569, 9570, 9572, 9573, 9574, 9575, 9580, 9581
        };
    }
}
