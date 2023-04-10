using MessagePack;

namespace Settlement.Core.Models;

[MessagePackObject]
public class RemarkSettingModel
{
    private const int ConvertToBase = 2;

    private const int UnderSettlePosition = 2;

    private const int MtdHoldPosition = 4;

    private const int KeyHoldPosition = 6;

    private string SettlementStatus { get; set; }

    public RemarkSettingModel()
    {
    }

    public RemarkSettingModel(byte settlementStatus)
    {
        SettlementStatus = Convert.ToString(settlementStatus, ConvertToBase).Reverse();
    }

    [Key("isPending")]
    public bool IsPending => !string.IsNullOrWhiteSpace(SettlementStatus) && SettlementStatus[0].Equals('1');

    [Key("isUndecided")]
    public bool IsUndecided => !string.IsNullOrWhiteSpace(SettlementStatus) && SettlementStatus.Length > 1 && SettlementStatus[1].Equals('1');

    [Key("isUnderSettle")]
    public bool IsUnderSettle => !string.IsNullOrWhiteSpace(SettlementStatus) && SettlementStatus.Length > UnderSettlePosition && SettlementStatus[UnderSettlePosition].Equals('1');

    [Key("isMtdHold")]
    public bool IsMtdHold => !string.IsNullOrWhiteSpace(SettlementStatus) && SettlementStatus.Length > MtdHoldPosition && SettlementStatus[MtdHoldPosition].Equals('1');

    [Key("isKeyHold")]
    public bool IsKeyHold => !string.IsNullOrWhiteSpace(SettlementStatus) && SettlementStatus.Length > KeyHoldPosition && SettlementStatus[KeyHoldPosition].Equals('1');
}