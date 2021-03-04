using Settlement.Core.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Cricket.Models
{
    public class AioMatch
    {
        public MatchDetail MatchDetail { get; set; }

        public List<MatchResultDetail> ResultDetails { get; set; }

        public TicketCounts TicketCounts { get; set; }

        public Permission Permission { get; set; }

        public HedgeMatchDetail HedgeMatchDetail { get; set; }
    }
}