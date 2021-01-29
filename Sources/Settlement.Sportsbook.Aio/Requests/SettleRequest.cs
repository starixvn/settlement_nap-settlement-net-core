using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Aio.Requests
{
    public class SettleRequest : IRequest<Result>
    {
        public int MatchId { get; set; }

        public string ActionName { get; set; }

        public bool IsReSettledTickets { get; set; }

        public string BetStatus { get; set; }

        public bool IsApplyHedging { get; set; }

        public int HedgeMatchId { get; set; }

        public List<ResourceItem> SelectedResources { get; set; }
    }
}