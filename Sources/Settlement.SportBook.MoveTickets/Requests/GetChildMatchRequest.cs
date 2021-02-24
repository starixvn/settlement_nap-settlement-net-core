using MediatR;
using Settlement.Core.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.MoveTickets.Requests
{
    public class GetChildMatchRequest : IRequest<List<ChildMatch>>
    {
        public int matchId { get; set; }
    }
}