using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Models;

public class Match
{
    public MatchDetail MatchDetail { get; set; }

    public IEnumerable<ResultDetail> ResultDetails { get; set; }

    public List<TicketCounts> TicketCounts { get; set; }

    public List<ChildMatchModel> ChildMatches { get; set; }

    public FantasyMatch FantasyMatch { get; set; }

    public BetDaq BetDaq { get; set; }

    public BetFair BetFair { get; set; }

    public Permission Permission { get; set; }

    public HedgeMatchDetail HedgeMatchDetail { get; set; }

    public List<ExternalResultModel> ExternalResults { get; set; }
}