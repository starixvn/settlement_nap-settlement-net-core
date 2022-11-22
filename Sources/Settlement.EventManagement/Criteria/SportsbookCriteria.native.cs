namespace Settlement.EventManagement.Criteria;

public class SportsbookCriteria : CriteriaBase
{
    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public string TicketStatus { get; set; }

    public string MatchStatus { get; set; }

    public string MatchCode { get; set; }

    public string LeagueIds { get; set; }

    public string SportTypes { get; set; }

    public bool IsIncludeTest { get; set; }

    public string AutoSetting { get; set; }

    public string HoldStatus { get; set; }

    public string OverStatus { get; set; }

    public string MatchType { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey()
    {
        return $"NAP_Set_MatchOtherSportsSel_{DbServer}";
    }

    public override bool IsValid()
    {
        return FromDate <= ToDate;
    }
}