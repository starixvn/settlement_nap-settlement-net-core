using MediatR;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Models;
using Settlement.Sportsbook.MoveTickets.Requests;
using Settlement.Sportsbook.MoveTickets.Services;

namespace Settlement.Sportsbook.MoveTickets.Handlers;

using Services.MultipleServer;

public class MoveTicketHandler : IRequestHandler<GetMatchRequest, MultiSportModel>,
    IRequestHandler<GetChildMatchRequest, List<ChildMatch>>,
    IRequestHandler<MoveTicketRequest, Result>,
    IRequestHandler<ValidateMatchesRequest, Result>,
    IRequestHandler<GetMoveTicketsMatchesRequest, List<MoveTicketsMatchDetail>>,
    IRequestHandler<MoveRunningTicketsRequest, Result>
{
    private readonly IMoveTicketService moveTicketService;
    private readonly PermissionService permissionService;
    private readonly MoveTicketMultipleServerService moveTicketMultipleServerService;

    public MoveTicketHandler(IMoveTicketService moveTicketService, PermissionService permissionService, MoveTicketMultipleServerService moveTicketMultipleServerService)
    {
        this.moveTicketService = moveTicketService;
        this.permissionService = permissionService;
        this.moveTicketMultipleServerService = moveTicketMultipleServerService;
    }

    public async Task<MultiSportModel> Handle(GetMatchRequest request, CancellationToken cancellationToken)
    {
        return new MultiSportModel
        {
            Sports = await moveTicketService.GetSportBook(request),
            Permission = permissionService.Permission
        };
    }

    public async Task<Result> Handle(MoveTicketRequest request, CancellationToken cancellationToken) => await moveTicketMultipleServerService.MoveTicket(request);

    public async Task<List<ChildMatch>> Handle(GetChildMatchRequest request, CancellationToken cancellationToken) => await moveTicketService.GetChildMatch(request);

    public async Task<Result> Handle(ValidateMatchesRequest request, CancellationToken cancellationToken) => await moveTicketMultipleServerService.ValidateMovingRunningTickets(request);

    public async Task<List<MoveTicketsMatchDetail>> Handle(GetMoveTicketsMatchesRequest request, CancellationToken cancellationToken) => await moveTicketService.GetMoveTicketsMatches(request);

    public async Task<Result> Handle(MoveRunningTicketsRequest request, CancellationToken cancellationToken) => await moveTicketMultipleServerService.MoveRunningTickets(request);
}