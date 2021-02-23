using System.Collections.Generic;

namespace Settlement.Sportsbook.MoveTickets.Models
{
    public class LeagueModel
    {
        public int LeagueId { get; set; }

        public string Name { get; set; }

        public List<MatchMoveTicket> Matches { get; set; }
    }
}
