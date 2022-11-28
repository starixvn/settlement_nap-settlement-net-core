using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using Settlement.Sportsbook.Aio.Services;

namespace Settlement.Sportsbook.Aio.Handlers;

public class AioHandler :
        IRequestHandler<GetMatchRequest, AioMatch>,
        IRequestHandler<SettleRequest, Result>,
        IRequestHandler<GetRecalResultRequest, List<Models.ResultDetail>>,
        IRequestHandler<CheckMarkedTicketsRequest, MarkedTickets>,
        IRequestHandler<CheckRunningOddsRequest, Result>,
        IRequestHandler<SaveScoreRequest, Result>,
        IRequestHandler<SettleChildMatchRequest, Result>,
        IRequestHandler<ResultSettingRequest, Boolean>

{
    private readonly IAioService aioService;

    private readonly PermissionService permissionService;

    private readonly AppSettingsKey appSettingsKey;

    public AioHandler(
        IAioService aioService,
        PermissionService permissionService,
        IOptions<AppSettingsKey> appSettingsKey)
    {
        this.aioService = aioService;
        this.permissionService = permissionService;
        this.appSettingsKey = appSettingsKey.Value;
    }

    public async Task<AioMatch> Handle(GetMatchRequest request, CancellationToken cancellationToken)
    {
        request.Permission = permissionService.Permission;
        return await aioService.GetMatch(request);
    }

    public async Task<Result> Handle(SettleRequest request, CancellationToken cancellationToken) =>
        await aioService.Settle(request);

    public async Task<List<Models.ResultDetail>> Handle(GetRecalResultRequest request,
        CancellationToken cancellationToken) => await aioService.GetRecalResult(request);

    public async Task<MarkedTickets>
        Handle(CheckMarkedTicketsRequest request, CancellationToken cancellationToken) =>
        await aioService.CheckMarkedTickets(request);

    public async Task<Result> Handle(CheckRunningOddsRequest request, CancellationToken cancellationToken)
    {
        if (appSettingsKey.EnableVerifyingRunningOdds)
        {
            return await aioService.VerifyNoRunningOdds(request);
        }

        return new Result();
    }

    public async Task<Result> Handle(SaveScoreRequest request, CancellationToken cancellationToken) =>
        await aioService.SaveScore(request);

    public async Task<Result> Handle(SettleChildMatchRequest request, CancellationToken cancellationToken) =>
        await aioService.SettleChildMatch(request);

    public async Task<bool> Handle(ResultSettingRequest request, CancellationToken cancellationToken) =>
        await aioService.ResultSetting(request);
}