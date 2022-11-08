namespace Settlement.Sportsbook.Soccer.Models
{
    public class BetDaq
    {
        public bool IsMoveBetDaq { get; set; }

        public bool IsExcludeBetDaq { get; set; }

        public bool IsSettleAbandonedMatchBetDaq { get; set; }

        public bool IsRefundRunningBetDaq { get; set; }
    }
}