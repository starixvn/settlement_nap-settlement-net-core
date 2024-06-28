namespace Settlement.Sportsbook.Soccer.Criteria;

public class RefundCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public string Action { get; set; }

    public int AdminId { get; set; }

    public string Ip { get; set; }

    public string BetStatus { get; set; }

    public int? HalfTimeHome { get; set; }

    public int? HalfTimeAway { get; set; }

    public int? FullTimeHome { get; set; }

    public int? FullTimeAway { get; set; }

    public string ResourceResult { get; set; }

    public string GoalSequence { get; set; }

    public byte SdtRecord { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public string BroadcastSessionId { get; } = Guid.NewGuid().ToString();

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    [SpParam(Ignored = true)]
    public string SpName => "NAP_Admin_Settlement_Refund_1_Push";

    [SpParam(Ignored = true)]
    public int SportType => Settlement.Constants.SportType.Soccer;

    public override string GetSettingKey() => $"Refund_{DbServer}";

    public override bool IsValid() => MatchId > 0;
}