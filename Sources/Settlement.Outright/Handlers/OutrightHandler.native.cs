using MediatR;
using Settlement.Core.Models;
using Settlement.Outright.Services;

namespace Settlement.Outright.Handlers;

public class OutrightHandler :
        IRequestHandler<SportLeagueRequest, SportLeague>,
        IRequestHandler<FilterRequest, OutrightModel>,
        IRequestHandler<GetLeagueInfoRequest, LeagueInfo>,
        IRequestHandler<OutrightUndoRequest, Result>,
        IRequestHandler<GetLogRequest, IEnumerable<OutrightLog>>,
        IRequestHandler<OutrightCalculateRequest, Result>,
        IRequestHandler<CheckOutrightVoidTicketRequest, bool>

{
    private readonly FilterService getDataFilterService;

    private readonly OutrightSettleService settleService;

    private readonly OutrightLogService outrightLogService;

    private readonly OutrightLogQueryService outrightLogQueryService;

    public OutrightHandler(
        FilterService getDataFilterService,
        OutrightSettleService settleService,
        OutrightLogService outrightLogService,
        OutrightLogQueryService outrightLogQueryService)
    {
        this.getDataFilterService = getDataFilterService;
        this.settleService = settleService;
        this.outrightLogService = outrightLogService;
        this.outrightLogQueryService = outrightLogQueryService;
    }

    public async Task<SportLeague> Handle(SportLeagueRequest request, CancellationToken cancellationToken) => await getDataFilterService.GetSportLeague(request);

    public async Task<OutrightModel> Handle(FilterRequest request, CancellationToken cancellationToken) => await getDataFilterService.Filter(request);

    public async Task<LeagueInfo> Handle(GetLeagueInfoRequest request, CancellationToken cancellationToken) => await settleService.GetLeagueInfo(request);

    public async Task<Result> Handle(OutrightUndoRequest request, CancellationToken cancellationToken) => await settleService.Uncalculate(request);

    public async Task<Result> Handle(OutrightCalculateRequest request, CancellationToken cancellationToken) => await settleService.Calculate(request);

    public async Task<IEnumerable<OutrightLog>> Handle(GetLogRequest request, CancellationToken cancellationToken)
    {
        return request.IsSubmit ? await outrightLogService.GetLogBySubmit(request) : await outrightLogService.GetLogForView(request);
    }

    public async Task<bool> Handle(CheckOutrightVoidTicketRequest request, CancellationToken cancellationToken)
        => await outrightLogQueryService.CheckOutrightvoidTicket(request);
}