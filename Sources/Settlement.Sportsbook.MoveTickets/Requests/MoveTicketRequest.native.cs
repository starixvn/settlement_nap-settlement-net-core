using MediatR;
using Settlement.Models;

namespace Settlement.Sportsbook.MoveTickets.Requests;

public class MoveTicketRequest : IRequest<Result>
{
    public int MatchId { get; set; }
}