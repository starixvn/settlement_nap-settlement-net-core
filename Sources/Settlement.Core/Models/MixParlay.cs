namespace Settlement.Core.Models
{
    public class MixParlay
    {
        public bool IsKeyScore { get; set; }

        public bool IsCalculated { get; set; }

        public int? IsCalculatingSingle { get; set; }

        public int? IsCalculatingMp { get; set; }

        public string BetStatus { get; set; }

        public bool IsExistMarkedTicketParlay { get; set; }

        public RemarkSettingModel Remark { get; set; }

        private bool EnableCaclMixParlay => IsKeyScore && IsCalculated && !IsExistMarkedTicketParlay && !BetStatus.Contains(Constants.BetStatus.RefundHT);

        public bool HasMixParlay
        {
            get
            {
                var isCalculatingSingle = IsCalculatingSingle == null || IsCalculatingSingle == 2;
                var isCalculatingParlay = (IsCalculatingMp == null || IsCalculatingMp == 2) && EnableCaclMixParlay;
                var isRemark = Remark.IsPending || isUndecidedMarked(Remark);

                return !isRemark && isCalculatingSingle && isCalculatingParlay;
            }
        }

        private static bool isUndecidedMarked(RemarkSettingModel remark)
        {
            return remark.IsMtdHold || remark.IsKeyHold || remark.IsUndecided || remark.IsUnderSettle;
        }
    }
}