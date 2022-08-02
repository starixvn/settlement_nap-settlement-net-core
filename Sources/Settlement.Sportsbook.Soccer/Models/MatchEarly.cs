using Settlement.Core.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Soccer.Models
{
    public class MatchEarly
    {
        public MatchDetail MatchDetail { get; set; }

        public List<ResultDetailModel> ResultDetail { get; set; }

        public TicketCounts TicketCounts { get; set; }

        public Permission Permission { get; set; }
    }
}