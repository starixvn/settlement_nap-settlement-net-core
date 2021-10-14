using MediatR;
using Settlement.Sportsbook.MoveTickets.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.MoveTickets.Requests
{
    public class GetMoveTicketsMatchesRequest : IRequest<List<MoveTicketsMatchDetail>>
    {
        public string MatchIds { get; set; }
    }
}