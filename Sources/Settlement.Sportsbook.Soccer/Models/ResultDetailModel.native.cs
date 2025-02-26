using Settlement.Core.Constants;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Models;

public sealed class ResultDetailModel
{
    private const int ToBase = 2;

    public string ResourceId { get; set; }

    public string TicketStatus { get; set; }

    public int Map { get; set; }

    public string BetType { get; set; }

    public string BetTypeName { get; set; }

    public string HomeValue { get; set; }

    public string AwayValue { get; set; }

    public byte? ResultStatusId { get; set; }

    public byte SettlementStatusId { get; set; }

    public string ResultStatus => ResultStatusId.ResultName(SettlementStatusId);

    public byte ResultSetting { get; set; }

    public List<string> MultipleTicketStatus { get; } = [];

    public ResultDetailSetting ResultSettingData => new()
    {
        ResultSetting = Convert.ToString(ResultSetting, ToBase).Reverse()
    };

    public int InRunning { get; set; }

    public int InWaiting { get; set; }

    public int BetMarkedCount { get; set; }

    public int BetCount { get; set; }

    public bool IsNotExistedValue => SettlementStatusId == SettlementStatus.Running && string.IsNullOrWhiteSpace(HomeValue) && string.IsNullOrWhiteSpace(AwayValue);

    public bool IsSpecialBettype { get; set; }

    public int OrdNo { get; set; }

    public override bool Equals(object obj)
    {
        return obj is ResultDetailModel result && result.ResourceId == ResourceId;
    }

    public override int GetHashCode()
    {
        return Map;
    }
}