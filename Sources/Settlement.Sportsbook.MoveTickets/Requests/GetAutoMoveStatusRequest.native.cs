using MediatR;

namespace Settlement.Sportsbook.MoveTickets.Requests;

public class GetAutoMoveStatusRequest : IRequest<bool>
{
    // No properties needed since we're just reading a flag from Redis
}