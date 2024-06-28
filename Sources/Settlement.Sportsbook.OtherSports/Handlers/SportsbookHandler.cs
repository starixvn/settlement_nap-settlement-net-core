using MediatR;
using Settlement.Constants;
using Settlement.Models;
using Settlement.Services;
using Settlement.Sportsbook.OtherSports.Models;
using Settlement.Sportsbook.OtherSports.Requests;
using Settlement.Sportsbook.OtherSports.Services;
using MatchResultDetail = Settlement.Sportsbook.OtherSports.Models.MatchResultDetail;

namespace Settlement.Sportsbook.OtherSports.Handlers;

public class SportsbookHandler(
    SportsbookService sportsbookService,
    SettlementActionsService settlementActionsService,
    PermissionService permissionService)
    :
        IRequestHandler<GetMatchRequest, OtherSportsMatchModel>,
        IRequestHandler<CalculateRequest, Result>,
        IRequestHandler<CheckingMarkedTicketsRequest, MarkedTickets>,
        IRequestHandler<GetLatestResultRequest, MatchResultDetail>
{
    private static readonly List<string> ActionRefund = [ActionType.RefundAll, ActionType.RefundHalfTime, ActionType.RefundFullTime];

    public async Task<OtherSportsMatchModel> Handle(GetMatchRequest request, CancellationToken cancellationToken)
    {
        var match = await sportsbookService.GetMatch(request);
        var permission = permissionService.GetPermission(CacheSettings.Keys.MemoryCacheManualPermission);

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