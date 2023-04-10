using Fanex.Data.Repository;
using Settlement.Core.Models;
using Settlement.Gaming.Criteria.Happy5;
using Settlement.Gaming.Requests;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Constants;
using Fanex.Settlement.ScaleOut.Services;
using Fanex.Settlement.ScaleOut.Request;
using Microsoft.Extensions.Options;

namespace Settlement.Gaming.Services.Happy5;

public interface SettlementService
{
    Task<Result> Settle(Happy5SettlementRequest request);
}

public class SettlementServiceImp : SettlementService
{
    private const int NotAuthorized = 1000;

    private readonly IDynamicRepository repository;

    private readonly INapSession currentSession;

    private readonly BallService ballService;

    private readonly IHttpContextAccessor accessor;

    private readonly ScaleOutSettleThirdPartyService scaleOutSettleThirdPartyService;

    private readonly AppSettingsKey appSettingsKey;

    private readonly ScaleOutSettleService scaleOutSettleService;

    public SettlementServiceImp(
        IDynamicRepository repository,
        INapSession currentSession,
        IHttpContextAccessor accessor,
        BallService ballService,
        ScaleOutSettleThirdPartyService scaleOutSettleThirdPartyService,
        IOptions<AppSettingsKey> options,
        ScaleOutSettleService scaleOutSettleService)
    {
        this.repository = repository;
        this.currentSession = currentSession;
        this.accessor = accessor;
        this.ballService = ballService;
        this.scaleOutSettleThirdPartyService = scaleOutSettleThirdPartyService;
        appSettingsKey = options.Value;
        this.scaleOutSettleService = scaleOutSettleService;
    }

    public async Task<Result> Settle(Happy5SettlementRequest request)
    {
        var permission = request.Permission;
        var isRecalculation = permission.CanCalculate && request.Action.Equals(ActionType.CalculateAll);
        var isRefund = permission.CanRefund && request.Action.Equals(ActionType.RefundAll);
        var hasPermission = isRecalculation || isRefund || permission.CanItAdmin;

        return hasPermission ? await SettleWhenHavePermission(request) : NoPermission;
    }

    private async Task<Result> SettleWhenHavePermission(Happy5SettlementRequest request)
    {
        var criteria = CreateCriteria(request);

        var validateDeploymentCriteria = new GetDeploymentInfoRequest
        {
            SPName = "NAP_Admin_Settlement_s164"
        };

        var validateDeploymentResult = await scaleOutSettleThirdPartyService.GetDeploymentInfo(validateDeploymentCriteria);
        if (validateDeploymentResult.ErrorCode == 0)
        {
            criteria.StrOldResult = await GetOldResult(request.MatchId);
            await UpdateResult(request);
            await UpdateMatchInfo(request);
            return await Execute(criteria);
        }

        return new Result
        {
            ErrCode = validateDeploymentResult.ErrorCode,
            ErrMsg = validateDeploymentResult.ErrorMessage
        };
    }

    private async Task<Result> Execute(SettlementCriteria criteria)
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

    private async Task<string> GetOldResult(int matchId)
    {
        var getOldResultCriteria = new GetOldResultCriteria { MatchId = matchId };
        await repository.ExecuteAsync(getOldResultCriteria);
        return getOldResultCriteria.StrOldResult;
    }

    private async Task UpdateResult(Happy5SettlementRequest request)
    {
        var updateMatchCriteria = new UpdateResultCriteria
        {
            MatchId = request.MatchId,
            Resources = ballService.ResourcesBalls(request.Balls)
        };

        await repository.ExecuteAsync(updateMatchCriteria);
    }

    private async Task UpdateMatchInfo(Happy5SettlementRequest request)
    {
        var updateRequest = new UpdateMatchInfo3rdRequest
        {
            Command = "completed",
            Action = request.Action,
            MatchId = request.MatchId,
            Creator = currentSession.UserId
        };

        await scaleOutSettleThirdPartyService.UpdateMatchInfo3rd(updateRequest);
    }

    private SettlementCriteria CreateCriteria(Happy5SettlementRequest request)
    {
        return new SettlementCriteria
        {
            MatchId = request.MatchId,
            Action = request.Action,
            AdminId = currentSession.UserId,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString()
        };
    }

    private static Result NoPermission => new()
    {
        ErrCode = NotAuthorized,
        ErrMsg = "You are not authorized to use this function. Please contact the admin for help."
    };
}