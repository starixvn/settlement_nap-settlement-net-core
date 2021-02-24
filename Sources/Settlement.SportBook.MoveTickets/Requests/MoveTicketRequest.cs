using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.MoveTickets.Requests
{
    public class MoveTicketRequest : IRequest<Result>
    {
        public int matchId { get; set; }
    }
}