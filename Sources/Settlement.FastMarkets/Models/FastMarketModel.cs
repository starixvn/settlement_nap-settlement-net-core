using System.Collections.Generic;
using Settlement.Core.Models;

namespace Settlement.FastMarkets.Models
{
    public class FastMarketModel
    {
        public int MatchId { get; set; }

        public string Action { get; set; }

        public List<BetType> BetTypes { get; set; }

        public string HandicapValue { get; set; }

        public List<EventCounter> EventCounters { get; set; }

        public TicketCounts TicketCount { get; set; }

        public List<ResultDetail> ResultDetail { get; set; }

        public Permission Permission { get; set; }
    }
}