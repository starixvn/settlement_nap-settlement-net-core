namespace Settlement.Sportsbook.Soccer.Models
{
    public class GoalRecordModel
    {
        private const string BetStatusFullTime = "FL:{0}-{1};";
        private const string BetStatusHalfTime = "1FL:{0}-{1};";
        private const string RefundHalfTime = "Refund HT;";

        public bool IsExistFgLg { get; set; }

        public bool IsExistHtFgLg { get; set; }

        public bool IsExistHalfTime { get; set; }

        public bool IsExistRefundHt { get; set; }

        public string FirstGoal { get; set; }

        public string LastGoal { get; set; }

        private string HalftimeBetStatusNotExistRefundHt => IsExistHtFgLg ? string.Format(BetStatusHalfTime, FirstGoal, LastGoal) : string.Empty;

        public string HalftimeBetStatus
        {
            get
            {
                if (IsExistRefundHt)
                {
                    return IsExistHalfTime ? $"{RefundHalfTime}{string.Format(BetStatusHalfTime, FirstGoal, LastGoal)}" : RefundHalfTime;
                }

                return HalftimeBetStatusNotExistRefundHt;
            }
        }

        public string FullTimeBetStatus => IsExistFgLg ? string.Format(BetStatusFullTime, FirstGoal, LastGoal) : string.Empty;

        public string BetStatus => $"{HalftimeBetStatus}{FullTimeBetStatus}";
    }
}