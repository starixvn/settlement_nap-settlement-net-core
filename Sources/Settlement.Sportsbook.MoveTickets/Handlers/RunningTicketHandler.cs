using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.MoveTickets.Models;
using Settlement.Sportsbook.MoveTickets.Requests;
using Settlement.Sportsbook.MoveTickets.Services;

namespace Settlement.Sportsbook.MoveTickets.Handlers;

public class RunningTicketHandler(MoveTicketService moveTicketService, MoveRunningService moveRunningService)
    :
        IRequestHandler<ValidateMatchesRequest, Result>,
        IRequestHandler<GetMoveTicketsMatchesRequest, List<MoveTicketsMatchDetail>>,
        IRequestHandler<MoveRunningTicketsRequest, Result>
{
    public async Task<Result> Handle(ValidateMatchesRequest request, CancellationToken cancellationToken) => await moveRunningService.ValidateMovingRunningTickets(request);

    public async Task<List<MoveTicketsMatchDetail>> Handle(GetMoveTicketsMatchesRequest request, CancellationToken cancellationToken) => await moveTicketService.GetMoveTicketsMatches(request);

    public async Task<Result> Handle(MoveRunningTicketsRequest request, CancellationToken cancellationToken) => await moveRunningService.MoveRunningTickets(request);
}