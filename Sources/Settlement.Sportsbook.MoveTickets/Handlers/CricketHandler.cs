using MediatR;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Models;
using Settlement.Sportsbook.MoveTickets.Requests;
using Settlement.Sportsbook.MoveTickets.Services;

namespace Settlement.Sportsbook.MoveTickets.Handlers;

public class CricketHandler :
    IRequestHandler<GetMatchRequest, MultiSportModel>,
    IRequestHandler<MoveTicketRequest, Result>
{
    private readonly MoveActionService moveActionService;

    private readonly MoveTicketService moveTicketService;

    private readonly PermissionService permissionService;

    public CricketHandler(
        MoveTicketService moveTicketService,
        PermissionService permissionService,
        MoveActionService moveActionService)
    {
        this.moveTicketService = moveTicketService;
        this.permissionService = permissionService;
        this.moveActionService = moveActionService;
    }

    public async Task<MultiSportModel> Handle(GetMatchRequest request, CancellationToken cancellationToken)
    {
        return new MultiSportModel
        {
            Sports = await moveTicketService.GetSportBook(request),
            Permission = permissionService.Permission
        };
    }

    public async Task<Result> Handle(MoveTicketRequest request, CancellationToken cancellationToken)
    {
        return await moveActionService.MoveTicket(request);
    }
}