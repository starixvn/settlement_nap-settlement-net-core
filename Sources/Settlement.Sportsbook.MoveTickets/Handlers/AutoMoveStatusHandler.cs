using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.MoveTickets.Requests;
using Settlement.Sportsbook.MoveTickets.Services;

namespace Settlement.Sportsbook.MoveTickets.Handlers;

public class AutoMoveStatusHandler(IAutoMoveStatusService autoMoveStatusService) : IRequestHandler<GetAutoMoveStatusRequest, Result>
{
    public async Task<Result> Handle(GetAutoMoveStatusRequest request, CancellationToken cancellationToken)
    {
        return await autoMoveStatusService.GetAutoMoveStatus();
    }
} 