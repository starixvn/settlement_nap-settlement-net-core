using System.Collections.Generic;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.OtherSports.Models
{
    public class MatchResultDetail
    {
        public MatchDetail MatchDetail { get; set; }

        public List<ResultDetail> ResultDetails { get; set; }

        public List<TicketCounts> TicketCount { get; set; }

        public MatchHedgeDetail HedgeMatchDetail { get; set; }
    }
}