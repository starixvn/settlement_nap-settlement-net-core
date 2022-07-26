using System.Collections.Generic;

namespace Settlement.Sportsbook.Soccer.Constants
{
    public class ActionKey
    {
        public static Dictionary<string, string> ActionDictionary => new Dictionary<string, string>
        {
            {"CAL", "ALL"},
            {"CAL-HT", "HT"},
            {"CAL-FT", "FT"},
            {"UNDO", "ALL"},
            {"REFUND", "ALL"},
            {"REFUND-HT", "HT"},
            {"REFUND-FT", "FT"}
        };
    }
}