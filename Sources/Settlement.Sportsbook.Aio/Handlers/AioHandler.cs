using Fanex.Settlement.MessageBridge.ResultAmendment;
using MassTransit;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Criteria.Cricket;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using Settlement.Sportsbook.Aio.Services;
using Result = Settlement.Core.Models.Result;

namespace Settlement.Sportsbook.Aio.Handlers;

public class AioHandler(
    IAioService aioService,
    PermissionService permissionService,
    ResultAmendmentService resultAmendmentService,
    IPublishEndpoint publishEndpoint,
    IOptions<AppSettingsKey> appSettingsKey)
    :
        IRequestHandler<GetMatchRequest, AioMatch>,
        IRequestHandler<SettleRequest, Result>,
        IRequestHandler<GetRecalResultRequest, List<Models.ResultDetail>>,
        IRequestHandler<CheckMarkedTicketsRequest, MarkedTickets>,
        IRequestHandler<CheckRunningOddsRequest, Result>,
        IRequestHandler<SaveScoreRequest, Result>,
        IRequestHandler<SettleChildMatchRequest, Result>,
        IRequestHandler<ResultSettingRequest, bool>,
        IRequestHandler<UpdateSettlementResultHistoryStatusRequest, bool>

{
    public async Task<AioMatch> Handle(GetMatchRequest request, CancellationToken cancellationToken)
    {
        request.Permission = permissionService.Permission;
        return await aioService.GetMatch(request);
    }

    public async Task<Result> Handle(SettleRequest request, CancellationToken cancellationToken)
    {
        var result = await aioService.Settle(request);

        if (result.HasResultAmendment && (request.SportType is SportType.BasketBall or SportType.ESports))
        {
            await publishEndpoint.Publish(
                new ResultAmendSettled(request.MatchId, result.SettledSessionId, result.IsOrg),
                new CancellationTokenSource(TimeSpan.FromSeconds(3)).Token);
        }

        return result;
    }

    public async Task<List<Models.ResultDetail>> Handle(GetRecalResultRequest request,
        CancellationToken cancellationToken) => await aioService.GetRecalResult(request);

    public async Task<MarkedTickets>
        Handle(CheckMarkedTicketsRequest request, CancellationToken cancellationToken) =>
        await aioService.CheckMarkedTickets(request);

    public async Task<Result> Handle(CheckRunningOddsRequest request, CancellationToken cancellationToken)
    {
        if (appSettingsKey.Value.EnableVerifyingRunningOdds)
        {
            return await aioService.VerifyNoRunningOdds(request);
        }

        return new Result();
    }

    public async Task<Result> Handle(SaveScoreRequest request, CancellationToken cancellationToken) =>
        await aioService.SaveScore(request);

    public async Task<Result> Handle(SettleChildMatchRequest request, CancellationToken cancellationToken)
    {
        var result = await aioService.SettleChildMatch(request);

        return result;
    }


    public async Task<bool> Handle(ResultSettingRequest request, CancellationToken cancellationToken) =>
        await aioService.ResultSetting(request);

    public async Task<bool> Handle(UpdateSettlementResultHistoryStatusRequest request, CancellationToken cancellationToken)
    {
        List<int> sports = [SportType.Tennis, SportType.VolleyBall, SportType.Badminton, SportType.TableTennis, SportType.BeachVolleyball];
        if (sports.Contains(request.SportType))
        {
            await publishEndpoint.Publish(
                new ResultAmendSettled(request.MatchId, request.SessionIds, request.IsOrg),
                new CancellationTokenSource(TimeSpan.FromSeconds(3)).Token);

            return true;
        }

        var criteria = new ResultHistoryUpdateCriteria
        {
            MatchId = request.MatchId,
            SessionIds = request.SessionIds,
            StatusId = -1
        };
        await resultAmendmentService.UpdateResultHistory(criteria);

        return true;
    }
}