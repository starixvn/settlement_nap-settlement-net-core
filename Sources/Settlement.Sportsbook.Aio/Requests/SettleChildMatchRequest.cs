using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Aio.Requests
{
    public class SettleChildMatchRequest : IRequest<Result>
    {
        public string ChildMatchIds { get; set; }

        public List<ChildMatchModel> ChildMatches { get; set; }

        public string ActionName { get; set; }

        public bool IsReSettledTickets { get; set; }

        public string BetStatus { get; set; }

        public List<ResourceItem> SelectedResources { get; set; }
    }
}