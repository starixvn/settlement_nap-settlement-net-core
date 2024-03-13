using MediatR;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Models;
using Settlement.Sportsbook.MoveTickets.Requests;
using Settlement.Sportsbook.MoveTickets.Services;

namespace Settlement.Sportsbook.MoveTickets.Handlers;

public class CricketHandler(
    MoveTicketService moveTicketService,
    PermissionService permissionService,
    MoveActionService moveActionService)
    :
        IRequestHandler<GetMatchRequest, MultiSportModel>,
        IRequestHandler<MoveTicketRequest, Result>
{
    public async Task<MultiSportModel> Handle(GetMatchRequest request, CancellationToken cancellationToken)
    {
        var permission = permissionService.GetPermission(CacheSettings.Keys.MemoryCacheManualPermission);
        return new MultiSportModel
        {
            Sports = await moveTicketService.GetSportBook(request),
            Permission = permission
        };
    }

    public async Task<Result> Handle(MoveTicketRequest request, CancellationToken cancellationToken)
    {
        return await moveActionService.MoveTicket(request);
    }
}