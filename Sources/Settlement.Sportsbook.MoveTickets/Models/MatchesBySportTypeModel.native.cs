using Settlement.Models;

namespace Settlement.Sportsbook.MoveTickets.Models;

public class MatchesBySportTypeModel
{
    public int SportType { get; set; }

    public List<Match> Matches { get; set; }
}