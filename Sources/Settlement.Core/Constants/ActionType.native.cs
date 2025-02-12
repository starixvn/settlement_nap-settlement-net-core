namespace Settlement.Core.Constants;

public static class ActionType
{
    public const string CalculateAll = "CAL";

    public const string CalculateHalfTime = "CAL-HT";

    public const string CalculateFullTime = "CAL-FT";

    public const string UnCalculate = "UNDO";

    public const string UnCalculateFullTime = "UNDO-FT";

    public const string RefundHalfTime = "REFUND-HT";

    public const string RefundFullTime = "REFUND-FT";

    public const string RefundAll = "REFUND";

    public const string BetDaq = "BETDAQ";

    public const string MoveTicket = "MoveTicket";

    public const string InstHT = "INST-HT";
}

public static class ActionId
{
    public const int AutoPayoutSettingLeague = 81057;

    public const int AutoPayoutSettingMatch = 81058;

    public const int NumberGameCal = 115;

    public const int NumberGameCalHt = 118;

    public const int NumberGameRefund = 117;

    public const int NumberGameRefundFt = 119;
}