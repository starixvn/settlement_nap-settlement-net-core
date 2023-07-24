using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Sportsbook.OtherSports.Criteria;

public class CalculateCriteria : NonQueryCommand
{
    public int AdminId { get; set; }

    public int MatchId { get; set; }

    public string BetStatus { get; set; }

    public string Action { get; set; }

    public string Ip { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public bool IsReSettledTickets { get; set; } = true;

    public int? RefResultStatus { get; set; }

    public string SelectedResources { get; set; }

    public string BroadcastSessionId { get; } = Guid.NewGuid().ToString();

    [SpParam(Ignored = true)]
    public bool IsHedgeMatch { get; set; }

    [SpParam(Ignored = true)]
    public int SportType { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    [SpParam(Ignored = true)]
    public string SpName => "NAP_Admin_Settlement_Profile_Push";

    public override bool IsValid() => AdminId > 0 && MatchId > 0;

    public override string GetSettingKey() => $"NAP_Admin_Settlement_Profile_Push_{DbServer}";
}