using System.Collections.Generic;
using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Requests
{
    public class SettleEarlyRequest : IRequest<Result>
    {
        public int MatchId { get; set; }

        public string ActionName { get; set; }

        public bool IsReSettledTickets { get; set; }

        public List<ResourceItem> SelectedResources { get; set; }
    }
}