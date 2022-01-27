namespace Settlement.Sportsbook.Soccer.Constants
{
    public static class ActionType
    {
        public const string CalculateAll = "CAL";

        public const string CalculateHalfTime = "CAL-HT";

        public const string CalculateFullTime = "CAL-FT";

        public const string Uncalculate = "UNDO";

        public const string RefundHalfTime = "REFUND-HT";

        public const string RefundFullTime = "REFUND-FT";

        public const string RefundAll = "REFUND";
    }
}