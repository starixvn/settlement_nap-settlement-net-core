using MediatR;
using Settlement.Core.Models;
using Settlement.Outright.Services;

namespace Settlement.Outright.Handlers;

public class OutrightHandler :
        IRequestHandler<SportLeagueRequest, SportLeague>,
        IRequestHandler<FilterRequest, SportOutright>,
        IRequestHandler<GetLeagueInfoRequest, LeagueInfo>,
        IRequestHandler<OutrightUndoRequest, Result>,
        IRequestHandler<GetLogRequest, IEnumerable<OutrightLog>>,
        IRequestHandler<OutrightCalculateRequest, Result>,
        IRequestHandler<CheckOutrightVoidTicketRequest, bool>,
        IRequestHandler<UpdateDeadHeatSettingRequest, Unit>,
        IRequestHandler<GetDeatHeadLeagueSettingRequest, byte?>

{
    private readonly FilterService getDataFilterService;

    private readonly OutrightSettleService settleService;

    private readonly OutrightLogService outrightLogService;

    private readonly OutrightSettleProcessService outrightSettleProcessService;

    public OutrightHandler(
        FilterService getDataFilterService,
        OutrightSettleService settleService,
        OutrightLogService outrightLogService,
        OutrightSettleProcessService outrightSettleProcessService)
    {
        this.getDataFilterService = getDataFilterService;
        this.settleService = settleService;
        this.outrightLogService = outrightLogService;
        this.outrightSettleProcessService = outrightSettleProcessService;
    }

    public async Task<SportLeague> Handle(SportLeagueRequest request, CancellationToken cancellationToken) => await getDataFilterService.GetSportLeague(request);

    public async Task<SportOutright> Handle(FilterRequest request, CancellationToken cancellationToken) => await getDataFilterService.Filter(request);

    public async Task<LeagueInfo> Handle(GetLeagueInfoRequest request, CancellationToken cancellationToken) => await settleService.GetLeagueInfo(request);

    public async Task<Result> Handle(OutrightUndoRequest request, CancellationToken cancellationToken) => await settleService.Uncalculate(request);

    public async Task<Result> Handle(OutrightCalculateRequest request, CancellationToken cancellationToken) => await settleService.Calculate(request);

    public async Task<IEnumerable<OutrightLog>> Handle(GetLogRequest request, CancellationToken cancellationToken)
    {
        return request.IsSubmit ? await outrightLogService.GetLogBySubmit(request) : await outrightLogService.GetLogForView(request);
    }

    public async Task<Unit> Handle(UpdateDeadHeatSettingRequest request, CancellationToken cancellationToken)
    {
        await settleService.UpdateDeadHeatSetting(request);
        return Unit.Value;
    }

    public async Task<bool> Handle(CheckOutrightVoidTicketRequest request, CancellationToken cancellationToken)
        => await outrightSettleProcessService.CheckOutrightVoidTicket(request);

    public async Task<byte?> Handle(GetDeatHeadLeagueSettingRequest request, CancellationToken cancellationToken)
        => await settleService.GetDeadHeadLeagueSetting(request);
}