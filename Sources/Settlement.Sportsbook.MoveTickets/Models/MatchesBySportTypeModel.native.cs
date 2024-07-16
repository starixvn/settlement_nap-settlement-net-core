using Settlement.Core.Models;

namespace Settlement.Sportsbook.MoveTickets.Models;

public class MatchesBySportTypeModel
{
    public int SportType { get; set; }

    public List<Match> Matches { get; set; }
}