using MediatR;
using Settlement.Sportsbook.MoveTickets.Requests;
using Settlement.Sportsbook.MoveTickets.Services;

namespace Settlement.Sportsbook.MoveTickets.Handlers;

public class AutoMoveStatusHandler(AutoMoveStatusService autoMoveStatusService) : 
    IRequestHandler<GetAutoMoveStatusRequest, bool>,
    IRequestHandler<UpdateAutoMoveStatusRequest, bool>
{
    public async Task<bool> Handle(GetAutoMoveStatusRequest request, CancellationToken cancellationToken)
    {
        return await autoMoveStatusService.GetAutoMoveStatus();
    }

    public async Task<bool> Handle(UpdateAutoMoveStatusRequest request, CancellationToken cancellationToken)
    {
        return await autoMoveStatusService.UpdateAutoMoveStatus(request.IsAutoMoveTicketsEnabled);
    }
}