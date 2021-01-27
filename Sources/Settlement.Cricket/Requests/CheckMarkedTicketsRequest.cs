using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Requests
{
    public class CheckMarkedTicketsRequest : IRequest<MarkedTickets>
    {
        public int MatchId { get; set; }

        public List<ResourceItem> SelectedResources { get; set; }
    }
}
