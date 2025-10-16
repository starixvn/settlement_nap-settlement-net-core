using Fanex.Settlement.MessageBridge.ResultAmendment;
using MassTransit;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;
using Settlement.FastMarkets.Services;
using MatchDetail = Settlement.FastMarkets.Models.MatchDetail;

namespace Settlement.FastMarkets.Handlers;

public class FastMarketHandler(
    IMatchDetailService matchDetailService,
    PermissionService permissionService,
    IFastMarketService fastMarketService,
    ISettingService settingService,
    INapSession session,
    IPublishEndpoint publishEndpoint)
    : IRequestHandler<MatchDetailRequest, MatchDetail>,
        IRequestHandler<BetTypeIntervalRequest, FastMarketModel>,
        IRequestHandler<GetLatestResultRequest, List<FastMarketResult>>,
        IRequestHandler<GetTimeMachineResultRequest, List<TimeMachineResult>>,
        IRequestHandler<GetOuTimeMachineResultRequest, List<TimeMachineResult>>,
        IRequestHandler<UpdateWaterBreakSettingRequest, Result>,
        IRequestHandler<SettleRequest, Result>,
        IRequestHandler<CheckingMarkedTicketsRequest, MarkedTickets>,
        IRequestHandler<InsertMessageRequest, Unit>
{
    public async Task<MatchDetail> Handle(MatchDetailRequest request, CancellationToken cancellationToken)
    {
        var permission = permissionService.Permission;
        var matchDetail = await matchDetailService.MatchInfo(request.MatchId);
        matchDetail.AutoSettingIcon.Disabled = !permission.AutoSettlement;
        matchDetail.HasAutoSettlementPermission = permission.AutoSettlement;
        return matchDetail;
    }

    public async Task<FastMarketModel> Handle(BetTypeIntervalRequest request, CancellationToken cancellationToken)
    {
        var permission = permissionService.Permission;
        var fastMarketModel = await fastMarketService.Query(request.MatchId);
        fastMarketModel.Permission = permission;
        return fastMarketModel;
    }

    public async Task<List<FastMarketResult>> Handle(GetLatestResultRequest request, CancellationToken cancellationToken)
        => await fastMarketService.GetLatestResult(request);

    public async Task<List<TimeMachineResult>> Handle(GetTimeMachineResultRequest request, CancellationToken cancellationToken)
        => await fastMarketService.GetTimeMachineResult(request);

    public async Task<Result> Handle(UpdateWaterBreakSettingRequest request, CancellationToken cancellationToken)
        => await settingService.UpdateWaterBreakSetting(request);

    public async Task<Result> Handle(SettleRequest request, CancellationToken cancellationToken)
    {
        var result = await fastMarketService.Calculate(request);

        if (result.HasResultAmendment)
        {
            await publishEndpoint.Publish(
                new ResultAmendSettled(request.MatchId, result.SettledSessionId, result.IsOrg),
                new CancellationTokenSource(TimeSpan.FromSeconds(3)).Token);
        }


        return result;
    }
    public async Task<MarkedTickets> Handle(CheckingMarkedTicketsRequest request, CancellationToken cancellationToken)
        => await matchDetailService.CheckingMarkedTickets(request);

    public async Task<Unit> Handle(InsertMessageRequest request, CancellationToken cancellationToken)
    {
        request.UserId = session.UserId;
        await fastMarketService.InsertMessageToLetstalk(request);
        return Unit.Value;
    }

    public async Task<List<TimeMachineResult>> Handle(GetOuTimeMachineResultRequest request, CancellationToken cancellationToken)
        => await fastMarketService.GetOuTimeMachineResult(request);
}