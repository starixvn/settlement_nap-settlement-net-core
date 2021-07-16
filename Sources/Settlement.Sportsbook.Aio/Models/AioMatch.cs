using Settlement.Core.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Aio.Models
{
    public class AioMatch
    {
        public MatchDetail MatchDetail { get; set; }

        public List<ResultDetail> ResultDetails { get; set; }

        public TicketCounts TicketCounts { get; set; }

        public Permission Permission { get; set; }

        public HedgeMatchDetail HedgeMatchDetail { get; set; }

        public List<ExternalResultModel> ExternalResults { get; set; }
    }
}