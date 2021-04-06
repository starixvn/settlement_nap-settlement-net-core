using MediatR;
using Settlement.Sportsbook.Cricket.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Cricket.Requests
{
    public class SettleRequest : IRequest<ResultCricket>
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