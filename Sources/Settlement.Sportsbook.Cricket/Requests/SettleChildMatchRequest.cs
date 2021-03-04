using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Cricket.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Cricket.Requests
{
    public class SettleChildMatchRequest : IRequest<Result>
    {
        public string ChildMatchIds { get; set; }

        public string ActionName { get; set; }

        public bool IsReSettledTickets { get; set; }

        public string BetStatus { get; set; }

        public List<ResourceItem> SelectedResources { get; set; }
    }
}