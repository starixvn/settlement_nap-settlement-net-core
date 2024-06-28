using Settlement.Constants;

namespace Settlement.Sportsbook.Soccer.Criteria;

public class RefundRunningThirdPartyTicketCriteria : NonQueryCommand
{
    private const string BetDaqPush = "NAP_Admin_Settlement_Refund_BetDaq_Push";

    private const string BetFairPush = "NAP_Admin_Settlement_Refund_BetFair_Push";

    public int MatchId { get; set; }

    public int AdminId { get; set; }

    public string Ip { get; set; }

    public string BroadcastSessionId { get; } = Guid.NewGuid().ToString();

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    [SpParam(Ignored = true)]
    public string ActionName { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    [SpParam(Ignored = true)]
    public string SpName => ActionName.IgnoreCaseEquals(ActionType.BetDaq) ? BetDaqPush : BetFairPush;

    public override string GetSettingKey() => ActionName.IgnoreCaseEquals(ActionType.BetDaq) ? $"{BetDaqPush}_{DbServer}" : $"{BetFairPush}_{DbServer}";

    public override bool IsValid() => MatchId > 0;
}