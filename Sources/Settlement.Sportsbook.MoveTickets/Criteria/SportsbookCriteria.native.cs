using Fanex.Data.Repository;

namespace Settlement.Sportsbook.MoveTickets.Criteria;

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

    public string HoldStatus { get; set; }

    public byte Page => 1;

    public override string GetSettingKey() => "NAP_Set_MatchOtherSportsSel";

    public override bool IsValid() => FromDate <= ToDate;
}