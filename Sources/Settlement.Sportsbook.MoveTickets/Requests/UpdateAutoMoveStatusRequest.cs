using MediatR;

namespace Settlement.Sportsbook.MoveTickets.Requests;

public class UpdateAutoMoveStatusRequest : IRequest<bool>
{
    public bool IsAutoMoveTicketsEnabled { get; set; }
} 