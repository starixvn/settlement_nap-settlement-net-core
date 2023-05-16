using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
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
    private const byte SeqOne = 1;
    private const byte SeqTwo = 2;
    private const byte SeqThree = 3;

    private readonly IDynamicRepository repository;

    private readonly INapSession currentSession;

    private readonly XmlConvertService xmlConvertService;

    private readonly IHttpContextAccessor accessor;

    private readonly ScaleOutSettleThirdPartyService scaleOutSettleThirdPartyService;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly AppSettingsKey appSettingsKey;
    private readonly LogDirectlyService logDirectlyService;

    public SettlementServiceImp(
        IDynamicRepository repository,
        INapSession currentSession,
        XmlConvertService xmlConvertService,
        IHttpContextAccessor accessor,
        ScaleOutSettleThirdPartyService scaleOutSettleThirdPartyService,
        ScaleOutSettleService scaleOutSettleService,
        IOptions<AppSettingsKey> options,
        LogDirectlyService logDirectlyService)
    {
        this.repository = repository;
        this.currentSession = currentSession;
        this.xmlConvertService = xmlConvertService;
        this.accessor = accessor;
        this.scaleOutSettleThirdPartyService = scaleOutSettleThirdPartyService;
        this.scaleOutSettleService = scaleOutSettleService;
        this.logDirectlyService = logDirectlyService;
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
            SPName = "NAP_Admin_Settlement_s161_Manual"
        };

        var validateDeploymentResult = await scaleOutSettleThirdPartyService.GetDeploymentInfo(validateDeploymentCriteria);
        if (validateDeploymentResult.ErrorCode == 0)
        {
            await UpdateResult(criteria);
            await UpdateMatchInfo(request);

            //TODO
            WriteDirectlyLog(request, criteria);

            return await Execute(criteria);
        }

        return new Result
        {
            ErrCode = validateDeploymentResult.ErrorCode,
            ErrMsg = validateDeploymentResult.ErrorMessage
        };
    }

    private void WriteDirectlyLog(NumberGameSettlementRequest request, RecalculateNumberGameCriteria criteria)
    {
        logDirectlyService.WriteLog(criteria.MatchId, $"REFUND Number Game for matchid: {criteria.MatchId}");

        if (!request.Balls.Any()) return;

        logDirectlyService.WriteLog(criteria.MatchId,
            $"Calculate Number Game for matchid:{criteria.MatchId} - [LIVE] - Sequence number: (1)");

        if (request.Balls.Exists(x => x.Seq == SeqTwo))
        {
            logDirectlyService.WriteLog(criteria.MatchId, $"Calculate Number Game for matchid:{criteria.MatchId} - [LIVE] - Sequence number: (2)");
        }
        else
        {
            logDirectlyService.WriteLog(criteria.MatchId, $"REFUND FT Number Game for matchid:{criteria.MatchId}");
            return;
        }

        if (request.Balls.Exists(x => x.Seq == SeqThree))
        {
            logDirectlyService.WriteLog(criteria.MatchId, $"Calculate Number Game for matchid:{criteria.MatchId} - [LIVE] - Sequence number: (3)");
            logDirectlyService.WriteLog(criteria.MatchId, $"Calculate Number Game for matchid: {criteria.MatchId}");
        }
        else
        {
            logDirectlyService.WriteLog(criteria.MatchId, $"REFUND FT Number Game for matchid:{criteria.MatchId}");
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
        var updateRequest = new UpdateMatchInfo3rdRequest
        {
            Command = EventStatus.Completed,
            MatchId = request.MatchId,
            Creator = currentSession.UserId,
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
            AdminId = currentSession.UserId,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            BallResults = GetBallResults(request.Balls)
        };
    }

    private Result NoPermission => new()
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