using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Gaming.Constants;
using Settlement.Gaming.Criteria.NumberGame;
using Settlement.Gaming.Models;
using Settlement.Gaming.Models.NumberGame;
using Settlement.Gaming.Requests;

namespace Settlement.Gaming.Services.NumberGame;

public interface SettlementService
{
    Task<Result> Settle(NumberGameSettlementRequest request);
}

public class SettlementServiceImp : SettlementService
{
    private const int NotAuthorized = 1000;
    private const byte SeqTwo = 2;
    private const byte SeqThree = 3;

    private readonly IDynamicRepository repository;

    private readonly XmlConvertService xmlConvertService;

    private readonly IHttpContextAccessor accessor;

    private readonly ScaleOutSettleThirdPartyService scaleOutSettleThirdPartyService;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly AppSettingsKey appSettingsKey;

    private readonly LogService logService;

    public SettlementServiceImp(
        IDynamicRepository repository,
        XmlConvertService xmlConvertService,
        IHttpContextAccessor accessor,
        ScaleOutSettleThirdPartyService scaleOutSettleThirdPartyService,
        ScaleOutSettleService scaleOutSettleService,
        IOptions<AppSettingsKey> options,
        LogService logService)
    {
        this.repository = repository;
        this.xmlConvertService = xmlConvertService;
        this.accessor = accessor;
        this.scaleOutSettleThirdPartyService = scaleOutSettleThirdPartyService;
        this.scaleOutSettleService = scaleOutSettleService;
        this.logService = logService;
        appSettingsKey = options.Value;
    }

    public async Task<Result> Settle(NumberGameSettlementRequest request)
    {
        var permission = request.Permission;
        var hasPermission = permission.CanCalculate || permission.CanItAdmin;

        return hasPermission ? await SettleWhenHavePermission(request) : NoPermission;
    }

    private async Task<Result> SettleWhenHavePermission(NumberGameSettlementRequest request)
    {
        var criteria = CreateCriteria(request);
        var validateDeploymentCriteria = new GetDeploymentInfoRequest
        {
            SpName = "NAP_Admin_Settlement_s161_Manual"
        };

        var validateDeploymentResult = await scaleOutSettleThirdPartyService.GetDeploymentInfo(validateDeploymentCriteria);
        if (validateDeploymentResult.ErrorCode == 0)
        {
            await UpdateResult(criteria);
            await UpdateMatchInfo(request);

            WriteDirectlyLog(request, criteria);

            var settledResult = await Execute(criteria);

            WriteSettledLog(request, criteria, settledResult);

            return settledResult;
        }

        return new Result
        {
            ErrCode = validateDeploymentResult.ErrorCode,
            ErrMsg = validateDeploymentResult.ErrorMessage
        };
    }

    private void WriteSettledLog(NumberGameSettlementRequest request, RecalculateNumberGameCriteria criteria, Result settledResult)
    {
        var actionId = request.Action.ToUpperInvariant() switch
        {
            ActionType.CalculateAll => ActionId.Cal,
            ActionType.CalculateHalfTime => ActionId.CalHt,
            ActionType.RefundAll => ActionId.Refund,
            ActionType.RefundFullTime => ActionId.RefundFt,
            _ => 0,
        };

        var message = $"Ball results: {criteria.BallResults} {settledResult.ErrMsg}";

        logService.ActionLog(criteria.MatchId, message, actionId);
    }

    private void WriteDirectlyLog(NumberGameSettlementRequest request, RecalculateNumberGameCriteria criteria)
    {
        var message = $"REFUND Number Game for matchId: {criteria.MatchId}";
        logService.WriteLog(criteria.MatchId, message);

        if (request.Balls.Any())
        {
            message = $"Calculate Number Game for matchId: {criteria.MatchId} - [LIVE] - Sequence number: (1)";
            logService.WriteLog(criteria.MatchId, message);

            WriteLogSequenceTwo(criteria.MatchId, request.Balls);
            WriteLogSequenceThree(criteria.MatchId, request.Balls);
        }
    }

    private void WriteLogSequenceTwo(int matchId, List<BallModel> balls)
    {
        var message = balls.Exists(x => x.Seq == SeqTwo)
                            ? $"Calculate Number Game for matchId: {matchId} - [LIVE] - Sequence number: (2)"
                            : $"REFUND FT Number Game for matchId: {matchId}";
        logService.WriteLog(matchId, message);
    }

    private void WriteLogSequenceThree(int matchId, List<BallModel> balls)
    {
        if (!balls.Exists(x => x.Seq == SeqTwo))
        {
            return;
        }

        if (balls.Exists(x => x.Seq == SeqThree))
        {
            logService.WriteLog(matchId, $"Calculate Number Game for matchId: {matchId} - [LIVE] - Sequence number: (3)");
            logService.WriteLog(matchId, $"Calculate Number Game for matchId: {matchId}");
        }
        else
        {
            logService.WriteLog(matchId, $"REFUND FT Number Game for matchId: {matchId}");
        }
    }

    private async Task UpdateResult(RecalculateNumberGameCriteria criteria)
    {
        var updateMatchCriteria = new UpdateResultCriteria
        {
            MatchId = criteria.MatchId,
            BallResults = criteria.BallResults
        };

        await repository.ExecuteAsync(updateMatchCriteria);
    }

    private async Task UpdateMatchInfo(NumberGameSettlementRequest request)
    {
        var updateRequest = new UpdateMatchInfo3RdRequest
        {
            Command = EventStatus.Completed,
            MatchId = request.MatchId,
            Creator = request.UserId,
            Action = request.Action
        };

        await scaleOutSettleThirdPartyService.UpdateMatchInfo3rd(updateRequest);
    }

    private async Task<Result> Execute(RecalculateNumberGameCriteria criteria)
    {
        var results = new List<Result>();
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
            results = await ResultMessage(results, server, criteria.ErrMsg);
        }

        return new Result
        {
            ErrCode = results.Count,
            ErrMsg = string.Join("<br/>", results.Select(r => r.ErrMsg).ToArray())
        };
    }

    private async Task<List<Result>> ResultMessage(List<Result> results, string server, string message)
    {
        if (!string.IsNullOrWhiteSpace(message))
        {
            var siteDbGroupId = await scaleOutSettleService.GetSiteGroupId(server);
            var result = new Result
            {
                ErrMsg = $"- SiteDbGroupId {siteDbGroupId}: {message}"
            };

            results.Add(result);
        }

        return results;
    }

    private RecalculateNumberGameCriteria CreateCriteria(NumberGameSettlementRequest request)
    {
        return new RecalculateNumberGameCriteria
        {
            MatchId = request.MatchId,
            AdminId = request.UserId,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            BallResults = GetBallResults(request.Balls)
        };
    }

    private static Result NoPermission => new()
    {
        ErrCode = NotAuthorized,
        ErrMsg = "You are not authorized to use this function. Please contact the admin for help."
    };

    private string GetBallResults(List<BallModel> balls)
    {
        var ballResultsItems = balls.Select(ball => new BallModel { Seq = ball.Seq, NumberBall = ball.NumberBall, Color = ball.Color }).ToList();

        var ballResults = new BallResultsModel
        {
            BallResultsItems = ballResultsItems
        };

        return xmlConvertService.Serialize(ballResults);
    }
}