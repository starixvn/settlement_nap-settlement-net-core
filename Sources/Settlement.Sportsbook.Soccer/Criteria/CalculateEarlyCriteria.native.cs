namespace Settlement.Sportsbook.Soccer.Criteria;

public class CalculateEarlyCriteria : NonQueryCommand
{
    public int AdminId { get; set; }

    public int MatchId { get; set; }

    public string SelectedResources { get; set; }

    public string Action { get; set; }

    public string Ip { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public bool IsReSettledTickets { get; set; }

    public string BroadcastSessionId { get; } = Guid.NewGuid().ToString();

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    [SpParam(Ignored = true)]
    public string SpName => "NAP_Admin_Settlement_Auto_1s_Push";

    [SpParam(Ignored = true)]
    public int SportType => Core.Constants.SportType.Soccer;

    public override string GetSettingKey() => $"NAP_Admin_Settlement_Auto_1s_Push_{DbServer}";

    public override bool IsValid() => AdminId > 0 && MatchId > 0;
}