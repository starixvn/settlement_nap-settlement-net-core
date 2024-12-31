namespace Settlement.Core.Models;

public class ResultDetailSetting
{
    private const int HoldResultPosition = 0;

    private const int ConfirmedRefundPosition = 1;

    private const int ConfirmedRefundSdtPosition = 2;

    private const int ConfirmedRefundMercyPosition = 3;

    public string ResultSetting { get; set; }

    public bool IsHoldResult => !string.IsNullOrWhiteSpace(ResultSetting) && ResultSetting[HoldResultPosition].Equals('1');

    public bool IsConfirmedRefund => !string.IsNullOrWhiteSpace(ResultSetting) && ResultSetting.Length > ConfirmedRefundPosition && ResultSetting[ConfirmedRefundPosition].Equals('1');

    public bool IsConfirmedRefundSdt => !string.IsNullOrWhiteSpace(ResultSetting) && ResultSetting.Length > ConfirmedRefundSdtPosition && ResultSetting[ConfirmedRefundSdtPosition].Equals('1');

    public bool IsConfirmedRefundMercy => !string.IsNullOrWhiteSpace(ResultSetting) && ResultSetting.Length > ConfirmedRefundMercyPosition && ResultSetting[ConfirmedRefundMercyPosition].Equals('1');
}