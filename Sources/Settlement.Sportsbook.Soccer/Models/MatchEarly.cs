using System.Collections.Generic;
using Settlement.Core.Models;

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