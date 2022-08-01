using System.Collections.Generic;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Models
{
    public class MatchEarly
    {
        public MatchDetail MatchDetail { get; set; }

        public HedgeMatchDetail HedgeMatchDetail { get; set; }

        public List<ResultDetail> ResultDetail { get; set; }

        public List<TicketCounts> TicketCounts { get; set; }

        public Permission Permission { get; set; }

        public List<ExternalResultModel> ExternalResults { get; set; }
    }
}