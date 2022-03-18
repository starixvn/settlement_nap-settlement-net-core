using System.Collections.Generic;
using MediatR;
using Settlement.Core.Models;
using Settlement.FastMarkets.Models;

namespace Settlement.FastMarkets.Requests
{
    public class SettleRequest : IRequest<Result>
    {
        public List<EventCounter> EventCounters { get; set; }

        public List<BetType> BetTypes { get; set; }

        public int MatchId { get; set; }

        public string Action { get; set; }

        public bool IsReSettledTickets { get; set; }

        public bool IsSettleDetermined { get; set; }
    }
}