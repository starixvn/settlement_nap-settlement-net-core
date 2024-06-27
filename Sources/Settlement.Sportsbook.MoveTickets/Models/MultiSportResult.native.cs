using Settlement.Core.Models;

namespace Settlement.Sportsbook.MoveTickets.Models;

public class MultiSportResult
{
    public List<Match> Matches { get; set; } = new();

    public List<ResultDetail> ResultDetails { get; set; }
}