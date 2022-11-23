namespace Settlement.Sportsbook.Aio.Constants;

public static class ActionKey
{
    public static Dictionary<string, string> ActionDictionary => new Dictionary<string, string>
        {
            {"CAL", "ALL"},
            {"REFUND", "ALL"},
            {"UNDO", "ALL"},
            {"CAL_EAR", "EAR"},
            {"UNDO_EAR", "EAR"},
            {"REFUND_EAR", "EAR"}
        };
}