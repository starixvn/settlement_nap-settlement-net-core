using MediatR;
using Settlement.Core.Models;
using Settlement.Outright.Services;

namespace Settlement.Outright.Handlers;

public class OutrightHandler :
        IRequestHandler<LeagueRequest, IEnumerable<League>>,
        IRequestHandler<FilterRequest, OutrightModel>,
        IRequestHandler<GetLeagueInfoRequest, LeagueInfo>,
        IRequestHandler<OutrightUndoRequest, Result>,
        IRequestHandler<GetLogRequest, IEnumerable<OutrightLog>>,
        IRequestHandler<OutrightCalculateRequest, Result>

{
    private readonly FilterService getDataFilterService;

    private readonly OutrightSettleService settleService;

    private readonly OutrightLogService outrightLogService;

    public OutrightHandler(FilterService getDataFilterService, OutrightSettleService settleService, OutrightLogService outrightLogService)
    {
        this.getDataFilterService = getDataFilterService;
        this.settleService = settleService;
        this.outrightLogService = outrightLogService;
    }

    public async Task<IEnumerable<League>> Handle(LeagueRequest request, CancellationToken cancellationToken) => await getDataFilterService.GetLeague(request);

    public async Task<OutrightModel> Handle(FilterRequest request, CancellationToken cancellationToken) => await getDataFilterService.Filter(request);

    public async Task<LeagueInfo> Handle(GetLeagueInfoRequest request, CancellationToken cancellationToken) => await settleService.GetLeagueInfo(request);

    public async Task<Result> Handle(OutrightUndoRequest request, CancellationToken cancellationToken) => await settleService.Uncalculate(request);

    public async Task<Result> Handle(OutrightCalculateRequest request, CancellationToken cancellationToken) => await settleService.Calculate(request);

    public async Task<IEnumerable<OutrightLog>> Handle(GetLogRequest request, CancellationToken cancellationToken) => await outrightLogService.GetLogForView(request);
}