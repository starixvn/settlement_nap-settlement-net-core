namespace Settlement.Core.Models
{
    public class Permission
    {
        public bool CanCalculate { get; set; }

        public bool CanMarkPending { get; set; }

        public bool CanMarkUnDecided { get; set; }

        public bool CanUncalculate { get; set; }

        public bool CanUncalculateInstant { get; set; }

        public bool CanRefund { get; set; }

        public bool CanCalculateMp { get; set; }

        public bool CanAutoPayout { get; set; }

        public bool CanViewSettlementLog { get; set; }

        public bool CanItAdmin { get; set; }

        public bool IsLeader { get; set; }

        public bool CanChangeScoreSource { get; set; }

        public bool CanRefundNotSDT { get; set; }
    }
}