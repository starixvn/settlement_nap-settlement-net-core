using MediatR;
using Settlement.Core.Models;
using Settlement.Outright.Requests;
using Settlement.Outright.Services;

namespace Settlement.Outright.Handlers;

public class OutrightHandler :
        IRequestHandler<LeagueRequest, IEnumerable<League>>,
        IRequestHandler<FilterRequest, OutrightModel>,
        IRequestHandler<GetLeagueInfoRequest, LeagueInfo>,
        IRequestHandler<SettleRequest, Result>

{
    private readonly FilterService getDataFilterService;

    private readonly OutrightSettleService settleService;

    public OutrightHandler(FilterService getDataFilterService, OutrightSettleService settleService)
    {
        this.getDataFilterService = getDataFilterService;
        this.settleService = settleService;
    }

    public async Task<IEnumerable<League>> Handle(LeagueRequest request, CancellationToken cancellationToken) => await getDataFilterService.GetLeague(request);

    public async Task<OutrightModel> Handle(FilterRequest request, CancellationToken cancellationToken) => await getDataFilterService.Filter(request);

    public async Task<LeagueInfo> Handle(GetLeagueInfoRequest request, CancellationToken cancellationToken) => await settleService.GetLeagueInfo(request);

    public async Task<Result> Handle(SettleRequest request, CancellationToken cancellationToken) => await settleService.Settle(request);
}