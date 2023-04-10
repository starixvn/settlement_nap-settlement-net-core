using MediatR;
using Settlement.Sportsbook.MoveTickets.Models;

namespace Settlement.Sportsbook.MoveTickets.Requests;

public class GetMoveTicketsMatchesRequest : IRequest<List<MoveTicketsMatchDetail>>
{
    public string MatchIds { get; set; }
}