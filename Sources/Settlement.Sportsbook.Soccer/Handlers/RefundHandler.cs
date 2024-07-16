using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;

namespace Settlement.Sportsbook.Soccer.Handlers;

using AutoMapper;
using Fanex.NAP.Client.Helpers.Web;
using Services.GetMatch;

public class RefundHandler(
    INapSession currentSession,
    IMatchService matchService,
    IRefundService refundService,
    IMapper mapper)
    :
        IRequestHandler<GetSpecificBetTypeRequest, List<string>>,
        IRequestHandler<CheckingMarkedTicketsRequest, MarkedTickets>,
        IRequestHandler<RefundRequest, Result>,
        IRequestHandler<RefundRunningThirdPartyTicketRequest, Result>,
        IRequestHandler<MoveBetRequest, Result>,
        IRequestHandler<GetMatchDetailThirdPartyBetTicketsRequest, List<MatchMoveBetTicket>>

{
    public async Task<List<string>> Handle(GetSpecificBetTypeRequest request, CancellationToken cancellationToken) =>
        await matchService.GetSpecificBetTypes(request);

    public async Task<MarkedTickets> Handle(CheckingMarkedTicketsRequest request, CancellationToken cancellationToken)
    {
        var criteria = mapper.Map<CheckingMarkedTicketsRequest, CheckingMarkedTicketsCriteria>(request);
        return await refundService.CheckMarkedTickets(criteria);
    }

    public async Task<Result> Handle(RefundRequest request, CancellationToken cancellationToken)
    {
        request.AdminId = currentSession.UserId;
        return await refundService.Refund(request);
    }

    public async Task<Result> Handle(RefundRunningThirdPartyTicketRequest request, CancellationToken cancellationToken)
    {
        request.AdminId = currentSession.UserId;
        return await refundService.RefundRunningThirdPartyTickets(request);
    }

    public async Task<Result> Handle(MoveBetRequest request, CancellationToken cancellationToken)
    {
        var criteria = mapper.Map<MoveBetRequest, MoveThirdPartyBetTicketCriteria>(request);
        criteria.AdminId = currentSession.UserId;
        return await refundService.MoveThirdPartyBetTickets(criteria);
    }

    public async Task<List<MatchMoveBetTicket>> Handle(GetMatchDetailThirdPartyBetTicketsRequest request,
        CancellationToken cancellationToken) =>
        await matchService.GetMatchDetailThirdPartyBetTicket(request);
}