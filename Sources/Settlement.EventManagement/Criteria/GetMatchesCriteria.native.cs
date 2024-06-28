using Settlement.Criteria;

namespace Settlement.EventManagement.Criteria;

public class GetMatchesCriteria : MultipleSiteCriteria
{
    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public int SportType => 1;

    public string LeagueIds { get; set; }

    public string MatchCode { get; set; }

    public int FilterOver { get; set; }

    public string MatchStatus { get; set; }

    public string HoldStatus { get; set; }

    public int MatchType { get; set; }

    public bool IsIncludeTest { get; set; }

    public override string GetSettingKey()
    {
        return $"NAP_Set_MatchSel_{DbServer}";
    }

    public override bool IsValid()
    {
        return FromDate <= ToDate;
    }
}