using Settlement.Core.Constants;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Aio.Models;

public sealed class ResultDetail
{
    private const int ToBase = 2;

    public string ResourceId { get; set; }

    public string TicketStatus { get; set; }

    public string BetType { get; set; }

    public string BetTypeName { get; set; }

    public string HomeValue { get; set; }

    public string AwayValue { get; set; }

    public byte? ResultStatusId { get; set; }

    public byte SettlementStatusId { get; set; }

    public int GroupId { get; set; }

    public string GroupName { get; set; }

    public int InputType { get; set; }

    public int GroupBetType { get; set; }

    public byte IsSpecialBettype { get; set; }

    public int Map { get; set; }

    public int OrdNo { get; set; }

    public int IntervalNo { get; set; }

    public string ResultStatus => ResultStatusId.ResultName(SettlementStatusId);

    public bool IsNotExistedValue => SettlementStatusId == SettlementStatus.Running && string.IsNullOrWhiteSpace(HomeValue) && string.IsNullOrWhiteSpace(AwayValue);

    public byte ResultSetting { get; set; }

    public ResultDetailSetting ResultSettingData => new()
    {
        ResultSetting = Convert.ToString(ResultSetting, ToBase).Reverse()
    };

    public List<InputOption> InputOptions { get; set; }

    public int MatchId { get; set; }

    public string HomeName { get; set; }

    public string AwayName { get; set; }

    public string OtherInfo { get; set; }

    public int BetCount { get; set; }

    public int InWaiting { get; set; }

    public int InRunning { get; set; }

    public int BetMarkedCount { get; set; }

    public int BetSettledCount { get; set; }

    public int BetRefundedCount { get; set; }

    public IList<OddFlexModel> OddFlex { get; set; } = [];

    public bool InValid { get; set; } = false;

    public override bool Equals(object obj)
    {
        return obj is ResultDetail result && result.ResourceId == ResourceId;
    }

    public override int GetHashCode()
    {
        return Map;
    }
}