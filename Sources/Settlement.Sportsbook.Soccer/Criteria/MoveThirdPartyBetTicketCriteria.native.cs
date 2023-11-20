namespace Settlement.Sportsbook.Soccer.Criteria;

public class MoveThirdPartyBetTicketCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public int AdminId { get; set; }

    public string Ip { get; set; }

    public int NewMatchId { get; set; }

    public string NewMatchCode { get; set; }

    [SpParam(Ignored = true)]
    public string ActionName { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public string BroadcastSessionId { get; } = Guid.NewGuid().ToString();

    [SpParam(Ignored = true)]
    public string SpName { get; set; }

    public override string GetSettingKey() => $"{SpName}_{DbServer}";

    public override bool IsValid() => MatchId > 0;
}