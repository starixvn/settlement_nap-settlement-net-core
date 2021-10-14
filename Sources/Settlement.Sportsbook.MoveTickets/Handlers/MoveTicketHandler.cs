using MediatR;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Models;
using Settlement.Sportsbook.MoveTickets.Requests;
using Settlement.Sportsbook.MoveTickets.Services;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.MoveTickets.Handlers
{
    public class MoveTicketHandler : IRequestHandler<GetMatchRequest, MultiSportModel>,
                                    IRequestHandler<GetChildMatchRequest, List<ChildMatch>>,
                                    IRequestHandler<MoveTicketRequest, Result>,
                                    IRequestHandler<ValidateMatchesRequest, Result>,
                                    IRequestHandler<GetMoveTicketsMatchesRequest, List<MoveTicketsMatchDetail>>,
                                    IRequestHandler<MoveRunningTicketsRequest, Result>
    {
        private readonly IMoveTicketService moveTicketService;
        private readonly PermissionService permissionService;

        public MoveTicketHandler(IMoveTicketService moveTicketService, PermissionService permissionService)
        {
            this.moveTicketService = moveTicketService;
            this.permissionService = permissionService;
        }

        public async Task<MultiSportModel> Handle(GetMatchRequest request, CancellationToken cancellationToken)
        {
            return new MultiSportModel
            {
                Sports = await moveTicketService.GetSportBook(request),
                Permission = permissionService.Permission
            };
        }

        public async Task<Result> Handle(MoveTicketRequest request, CancellationToken cancellationToken) => await moveTicketService.MoveTicket(request);

        public async Task<List<ChildMatch>> Handle(GetChildMatchRequest request, CancellationToken cancellationToken) => await moveTicketService.GetChildMatch(request);

        public async Task<Result> Handle(ValidateMatchesRequest request, CancellationToken cancellationToken) => await moveTicketService.ValidateMovingRunningTickets(request);

        public async Task<List<MoveTicketsMatchDetail>> Handle(GetMoveTicketsMatchesRequest request, CancellationToken cancellationToken) => await moveTicketService.GetMoveTicketsMatches(request);

        public async Task<Result> Handle(MoveRunningTicketsRequest request, CancellationToken cancellationToken) => await moveTicketService.MoveRunningTickets(request);
    }
}