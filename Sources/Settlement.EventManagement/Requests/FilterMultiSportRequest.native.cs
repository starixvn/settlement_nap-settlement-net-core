using Settlement.EventManagement.Models.MultiSports;

namespace Settlement.EventManagement;

public class FilterMultiSportRequest : IRequest<MultiSportModel>
{
    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public string MatchCode { get; set; }

    public string TicketStatus { get; set; }

    public string MatchStatus { get; set; }

    public string LeagueIds { get; set; }

    public string SportTypes { get; set; }

    public bool IsIncludeTest { get; set; }

    public string AutoPayout { get; set; }

    public string HoldStatus { get; set; }

    public string OverStatus { get; set; }

    public string MatchType { get; set; }
}