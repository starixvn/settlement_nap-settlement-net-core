using MediatR;
using Settlement.Core.Models;
using Settlement.Outright.Services;

namespace Settlement.Outright.Handlers;

public class OutrightHandler(
    FilterService getDataFilterService,
    OutrightSettleService settleService,
    OutrightLogService outrightLogService,
    OutrightSettleProcessService outrightSettleProcessService,
    OutrightPermissionService permission)
    :
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
    public async Task<SportLeague> Handle(SportLeagueRequest request, CancellationToken cancellationToken) => await getDataFilterService.GetSportLeague(request);

    public async Task<SportOutright> Handle(FilterRequest request, CancellationToken cancellationToken)
    {
        var sportOutright = await getDataFilterService.Filter(request);
        sportOutright.Permission = permission.Permission;
        return sportOutright;
    }

    public async Task<LeagueInfo> Handle(GetLeagueInfoRequest request, CancellationToken cancellationToken)
    {
        var leagueInfo = await settleService.GetLeagueInfo(request);
        leagueInfo.Permission = permission.Permission;
        return leagueInfo;
    }

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