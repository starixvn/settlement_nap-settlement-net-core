using System.Collections.Generic;

namespace Settlement.Sportsbook.MoveTickets.Models
{
    public class MatchesBySportTypeModel
    {
        public int SportType { get; set; }

        public List<MatchMoveTicket> Matches { get; set; }
    }
}