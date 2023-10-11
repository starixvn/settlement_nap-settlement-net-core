namespace Settlement.Sportsbook.Soccer.Constants;

public static class ActionKey
{
    public static Dictionary<string, string> ActionDictionary => new()
    {
        {"CAL", "ALL"},
        {"CAL-HT", "HT"},
        {"CAL-FT", "FT"},
        {"UNDO", "ALL"},
        {"REFUND", "ALL"},
        {"REFUND-HT", "HT"},
        {"REFUND-FT", "FT"},
        {"UNDO-FT","FT"}
    };
}