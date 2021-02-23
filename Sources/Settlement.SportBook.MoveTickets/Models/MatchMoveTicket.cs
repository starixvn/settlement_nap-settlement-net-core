
using Settlement.Core.Models;
using Settlement.Sportsbook.MoveTickets.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.MoveTickets.Models
{
    public class MatchMoveTicket: Match
    {
        public List<ReferenceAction> ReferenceActions { get; set; }
    }
}
