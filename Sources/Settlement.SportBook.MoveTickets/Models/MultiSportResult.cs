using Settlement.Core.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.MoveTickets.Models
{
    public class MultiSportResult
    {
        public MultiSportResult()
        {
            Matches = new List<MatchMoveTicket>();
        }

        public List<MatchMoveTicket> Matches { get; set; }

        public List<ResultDetail> ResultDetails { get; set; }
    }
}