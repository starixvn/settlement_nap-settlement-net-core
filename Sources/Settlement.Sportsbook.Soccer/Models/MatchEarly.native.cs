using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Models;

public class MatchEarly
{
    public MatchDetail MatchDetail { get; set; }

    public List<ResultDetailModel> ResultDetail { get; set; }

    public List<ExternalResultDetailModel> ExternalResults { get; set; }

    public TicketCounts TicketCounts { get; set; }

    public Permission Permission { get; set; }

    public HedgeMatchDetail HedgeMatchDetail { get; set; }
}