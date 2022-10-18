using MediatR;
using Settlement.Core.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.MoveTickets.Requests
{
    public class GetChildMatchRequest : IRequest<List<ChildMatch>>
    {
        public string MatchIds { get; set; }

        public string Mode { get; set; }
    }
}