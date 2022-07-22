using System.Collections.Generic;

namespace Settlement.Sportsbook.Soccer.Constants
{
    public class ActionKey
    {
        public static Dictionary<string, int> ActionDictionary => new Dictionary<string, int>
        {
            {"CAL", 100},
            {"CAL-HT", 100},
            {"CAL-FT", 100},
            {"UNDO", 103},
            {"REFUND", 109},
            {"REFUND-HT", 110},
            {"REFUND-FT", 111}
        };
    }
}