using MediatR;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;

namespace Settlement.Sportsbook.Soccer.Handlers;

using Services.GetMatch;

internal class RefundHandler :
    IRequestHandler<GetSpecificBetTypeRequest, List<string>>,
    IRequestHandler<CheckingMarkedTicketsRequest, MarkedTickets>,
    IRequestHandler<RefundRequest, Result>,
    IRequestHandler<RefundRunningThirdPartyTicketRequest, Result>,
    IRequestHandler<MoveBetRequest, Result>,
    IRequestHandler<GetMatchDetailThirdPartyBetTicketsRequest, List<MatchMoveBetTicket>>

{
    private readonly IMatchService matchService;

    private readonly IRefundService refundService;

    public RefundHandler(IMatchService matchService, IRefundService refundService)
    {
        this.matchService = matchService;
        this.refundService = refundService;
    }

    public async Task<List<string>> Handle(GetSpecificBetTypeRequest request, CancellationToken cancellationToken) =>
        await matchService.GetSpecificBetTypes(request);

    public async Task<MarkedTickets>
        Handle(CheckingMarkedTicketsRequest request, CancellationToken cancellationToken) =>
        await refundService.CheckMarkedTickets(request);

    public async Task<Result> Handle(RefundRequest request, CancellationToken cancellationToken) =>
        await refundService.Refund(request);

    public async Task<Result> Handle(RefundRunningThirdPartyTicketRequest request,
        CancellationToken cancellationToken) =>
        await refundService.RefundRunningThirdPartyTickets(request);

    public async Task<Result> Handle(MoveBetRequest request, CancellationToken cancellationToken) =>
        await refundService.MoveThirdPartyBetTickets(request);

    public async Task<List<MatchMoveBetTicket>> Handle(GetMatchDetailThirdPartyBetTicketsRequest request,
        CancellationToken cancellationToken) =>
        await matchService.GetMatchDetailThirdPartyBetTicket(request);
}