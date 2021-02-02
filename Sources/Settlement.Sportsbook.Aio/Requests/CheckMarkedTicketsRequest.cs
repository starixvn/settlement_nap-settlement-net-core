using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Aio.Requests
{
    public class CheckMarkedTicketsRequest : IRequest<MarkedTickets>
    {
        public int MatchId { get; set; }

        public List<ResourceItem> SelectedResources { get; set; }
    }
}
