using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.MoveTickets.Requests;

public class GetAutoMoveStatusRequest : IRequest<Result>
{
    // No properties needed since we're just reading a flag from Redis
} 