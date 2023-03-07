using MediatR;
using Settlement.Core.Services;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;
using Settlement.FastMarkets.Services;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Settlement.Core.Models;
using MatchDetail = Settlement.FastMarkets.Models.MatchDetail;

namespace Settlement.FastMarkets.Handlers;

public class FastMarketHandler : IRequestHandler<MatchDetailRequest, MatchDetail>,
    IRequestHandler<BetTypeIntervalRequest, FastMarketModel>,
    IRequestHandler<GetLastestResultRequest, List<FastMarketResult>>,
    IRequestHandler<GetTimeMachineResultRequest, List<TimeMachineResult>>,
    IRequestHandler<UpdateWaterBreakSettingRequest, Result>,
    IRequestHandler<SettleRequest, Result>,
    IRequestHandler<CheckingMarkedTicketsRequest, MarkedTickets>
{
    private readonly IMatchDetailService matchDetailService;

    private readonly PermissionService permissionService;

    private readonly IFastMarketService fastMarketService;

    private readonly ISettingService settingService;

    public FastMarketHandler(
        IMatchDetailService matchDetailService, 
        PermissionService permissionService, 
        IFastMarketService fastMarketService,
        ISettingService settingService)
    {
        this.matchDetailService = matchDetailService;
        this.permissionService = permissionService;
        this.fastMarketService = fastMarketService;
        this.settingService = settingService;
    }

    public async Task<MatchDetail> Handle(MatchDetailRequest request, CancellationToken cancellationToken)
    {
        var matchDetail = await matchDetailService.MatchInfo(request.MatchId);
        matchDetail.AutoSettingIcon.Disabled = !permissionService.Permission.AutoSettlement;
        return matchDetail;
    }

    public async Task<FastMarketModel> Handle(BetTypeIntervalRequest request, CancellationToken cancellationToken)
    {
        var fastMarketModel = await fastMarketService.Query(request.MatchId);
        fastMarketModel.Permission = permissionService.Permission;
        return fastMarketModel;
    }

    public async Task<List<FastMarketResult>> Handle(GetLastestResultRequest request, CancellationToken cancellationToken) 
        => await fastMarketService.GetLastestResult(request);

    public async Task<List<TimeMachineResult>> Handle(GetTimeMachineResultRequest request, CancellationToken cancellationToken) 
        => await fastMarketService.GetTimeMachineResult(request);

    public async Task<Result> Handle(UpdateWaterBreakSettingRequest request, CancellationToken cancellationToken) 
        => await settingService.UpdateWaterBreakSetting(request);

    public async Task<Result> Handle(SettleRequest request, CancellationToken cancellationToken) 
        => await fastMarketService.Calculate(request);

    public async Task<MarkedTickets> Handle(CheckingMarkedTicketsRequest request, CancellationToken cancellationToken) 
        => await matchDetailService.CheckingMarkedTickets(request);
}