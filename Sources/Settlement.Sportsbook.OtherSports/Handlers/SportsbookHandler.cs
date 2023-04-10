using MediatR;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.OtherSports.Models;
using Settlement.Sportsbook.OtherSports.Requests;
using Settlement.Sportsbook.OtherSports.Services;
using MatchResultDetail = Settlement.Sportsbook.OtherSports.Models.MatchResultDetail;

namespace Settlement.Sportsbook.OtherSports.Handlers;

public class SportsbookHandler :
    IRequestHandler<GetMatchRequest, OtherSportsMatchModel>,
    IRequestHandler<CalculateRequest, Result>,
    IRequestHandler<CheckingMarkedTicketsRequest, MarkedTickets>,
    IRequestHandler<GetLatestResultRequest, MatchResultDetail>
{
    private readonly SportsbookService sportsbookService;

    private readonly SettlementActionsService settlementActionsService;

    private readonly PermissionService permissionService;

    private static readonly List<string> ActionRefund = new() { ActionType.RefundAll, ActionType.RefundHalfTime, ActionType.RefundFullTime };

    public SportsbookHandler(SportsbookService sportsbookService, SettlementActionsService settlementActionsService, PermissionService permissionService)
    {
        this.sportsbookService = sportsbookService;
        this.settlementActionsService = settlementActionsService;
        this.permissionService = permissionService;
    }

    public async Task<OtherSportsMatchModel> Handle(GetMatchRequest request, CancellationToken cancellationToken)
    {
        var match = await sportsbookService.GetMatch(request);
        var permission = permissionService.Permission;

        return new OtherSportsMatchModel
        {
            Match = match,
            Permission = permission
        };
    }

    public async Task<Result> Handle(CalculateRequest request, CancellationToken cancellationToken)
    {
        if (!ActionRefund.Exists(action => action == request.Action) && sportsbookService.IsModifyResultDetailGroup(request.SportType))
        {
            return await settlementActionsService.CalculateWithResultDetail(request);
        }

        return await settlementActionsService.Calculate(request);
    }

    public async Task<MarkedTickets> Handle(CheckingMarkedTicketsRequest request, CancellationToken cancellationToken) => await settlementActionsService.CheckMarkedTickets(request);

    public async Task<MatchResultDetail> Handle(GetLatestResultRequest request, CancellationToken cancellationToken) => await sportsbookService.GetLatestResult(request);
}