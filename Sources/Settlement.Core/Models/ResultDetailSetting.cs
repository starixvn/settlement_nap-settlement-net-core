namespace Settlement.Core.Models
{
    public class ResultDetailSetting
    {
        private const int HoldResultPosition = 0;

        private const int ConfirmedRefundPosition = 1;

        public string ResultSetting { get; set; }

        public bool IsHoldResult => !string.IsNullOrWhiteSpace(ResultSetting) && ResultSetting[HoldResultPosition].Equals('1');

        public bool IsConfirmedRefund => !string.IsNullOrWhiteSpace(ResultSetting) && ResultSetting.Length > ConfirmedRefundPosition && ResultSetting[ConfirmedRefundPosition].Equals('1');
    }
}