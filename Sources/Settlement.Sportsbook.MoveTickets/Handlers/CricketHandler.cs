using AutoMapper;
using MediatR;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Criteria;
using Settlement.Sportsbook.MoveTickets.Models;
using Settlement.Sportsbook.MoveTickets.Requests;
using Settlement.Sportsbook.MoveTickets.Services;

namespace Settlement.Sportsbook.MoveTickets.Handlers;

public class CricketHandler :
    IRequestHandler<GetMatchRequest, MultiSportModel>,
    IRequestHandler<MoveTicketRequest, Result>
{
    private readonly IMapper mapper;

    private readonly MoveActionService moveActionService;

    private readonly MoveTicketService moveTicketService;

    private readonly PermissionService permissionService;

    public CricketHandler(
        IMapper mapper,
        MoveTicketService moveTicketService,
        PermissionService permissionService,
        MoveActionService moveActionService)
    {
        this.mapper = mapper;
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
        var criteria = mapper.Map<MoveTicketRequest, MoveTicketCriteria>(request);
        return await moveActionService.MoveTicket(criteria);
    }
}