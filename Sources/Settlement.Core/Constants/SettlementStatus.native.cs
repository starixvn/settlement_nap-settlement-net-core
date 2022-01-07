namespace Settlement.Core.Constants
{
    public static class SettlementStatus
    {
        public const byte Running = 0;

        public const byte Refund = 1;

        public const byte RefundHT = 2;

        public const byte RefundFT = 3;

        public const byte Completed = 4;

        public const byte Abandoned1H = 5;

        public const byte Abandoned2H = 6;
    }
}