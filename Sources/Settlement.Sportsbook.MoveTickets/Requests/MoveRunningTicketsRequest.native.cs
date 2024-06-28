using MediatR;
using Settlement.Models;

namespace Settlement.Sportsbook.MoveTickets.Requests;

public class MoveRunningTicketsRequest : IRequest<Result>
{
    public int MatchId { get; set; }

    public int DestinationMatchId { get; set; }

    public bool IsOverrideResult { get; set; }
}