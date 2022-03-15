using MessagePack;
using Settlement.Core.Models;

namespace Settlement.EventManagement.Models
{
    [MessagePackObject]
    public class MixParlay
    {
        private const int IsSuccess = 2;

        private const string BetStatusHt = "Refund HT";

        private bool IsCalculated { get; }

        private int? IsCalculatingSingle { get; }

        private int? IsCalculatingMp { get; }

        private string BetStatusValue { get; }

        private RemarkSettingModel Remark { get; }

        public MixParlay()
        {
        }

        public MixParlay(
            bool isCalculated,
            bool isKeyScore,
            int? isCalculatingSingle,
            int? isCalculatingMp,
            string betStatusValue,
            RemarkSettingModel remark)
        {
            IsCalculated = isCalculated;
            IsCalculatingSingle = isCalculatingSingle;
            IsCalculatingMp = isCalculatingMp;
            BetStatusValue = betStatusValue;
            Remark = remark;
            IsKeyScore = isKeyScore;
        }

        private bool EnableCalcMixParlay => IsKeyScore && IsCalculated && !BetStatusValue.Contains(BetStatusHt);

        [Key("isKeyScore")]
        public bool IsKeyScore { get; }

        [Key("hasMixParlay")]
        public bool HasMixParlay
        {
            get
            {
                var isCalculatingSingle = IsCalculatingSingle == null || IsCalculatingSingle == IsSuccess;
                var isCalculatingParlay = (IsCalculatingMp == null || IsCalculatingMp == IsSuccess) && EnableCalcMixParlay;
                var isRemark = Remark.IsPending || IsUndecidedMarked(Remark);

                return !isRemark && isCalculatingSingle && isCalculatingParlay;
            }
        }

        private static bool IsUndecidedMarked(RemarkSettingModel remark)
        {
            return remark.IsMtdHold || remark.IsKeyHold || remark.IsUndecided || remark.IsUnderSettle;
        }
    }
}