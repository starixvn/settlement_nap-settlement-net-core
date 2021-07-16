using System.Collections.Generic;

namespace Settlement.Core.Models
{
    public class MatchResultDetail
    {
        public MatchDetail MatchDetail { get; set; }

        public List<ResultDetail> ResultDetail { get; set; }

        public List<TicketCounts> TicketCount { get; set; }

    }
}