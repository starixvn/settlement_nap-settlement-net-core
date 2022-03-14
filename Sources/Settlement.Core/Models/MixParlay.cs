using MessagePack;

namespace Settlement.Core.Models
{
    [MessagePackObject]
    public class MixParlay
    {
        public MixParlay(
            bool isCalculated,
            bool isKeyScore,
            int? isCalculatingSingle,
            int? isCalculatingMp,
            string betStatus,
            RemarkSettingModel remark)
        {
            IsCalculated = isCalculated;
            IsCalculatingSingle = isCalculatingSingle;
            IsCalculatingMp = isCalculatingMp;
            BetStatus = betStatus;
            Remark = remark;
            IsKeyScore = isKeyScore;
        }

        [Key("isKeyScore")]
        public bool IsKeyScore { get; set; }

        [Key("isCalculated")]
        public bool IsCalculated { get; set; }

        [Key("isCalculatingSingle")]
        public int? IsCalculatingSingle { get; set; }

        [Key("isCalculatingMp")]
        public int? IsCalculatingMp { get; set; }

        [Key("betStatus")]
        public string BetStatus { get; set; }

        [Key("isExistMarkedTicketParlay")]
        public bool IsExistMarkedTicketParlay { get; set; }

        [Key("remark")]
        public RemarkSettingModel Remark { get; set; }

        private bool EnableCaclMixParlay => IsKeyScore && IsCalculated && !IsExistMarkedTicketParlay && !BetStatus.Contains(Constants.BetStatus.RefundHT);

        [Key("hasMixParlay")]
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