using Fanex.Settlement.ScaleOut.Criteria.Normal;

namespace Settlement.Sportsbook.MoveTickets.Services;

using Criteria;
using Fanex.Data.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Models;
using Requests;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;

public interface MoveActionService
{
    Task<Result> MoveTicket(MoveTicketRequest request);
}

public class MoveActionServiceImp(
    IDynamicRepository repository,
    INapSession currentSession,
    IHttpContextAccessor accessor,
    LogService logService,
    IOptions<AppSettingsKey> appSettingsKey)
    : MoveActionService
{
    private readonly AppSettingsKey appSettingsKey = appSettingsKey.Value;

    private const string NotExistValidTicketToMove =
        "WARNING! Cannot continue due to current has no valid ticket to move.";

    private const int NotExistValidTicketToMoveCode = 1_001_049;
    private const int ActionIdMoveTicketFailed = 81026;
    private const int ActionIdMoveTicket = 81025;

    public async Task<Result> MoveTicket(MoveTicketRequest request)
    {
        var result = await VerifyBeforeMoveTickets(request);
        if (result.ErrCode > 0)
        {
            await logService.ActionLog(request.MatchId, result.ErrMsg, ActionIdMoveTicketFailed);
            return result;
        }

        var getTickets = await GetTickets(request.MatchId);

        return await ExecuteMoveTicket(request, getTickets);
    }

    private async Task<Result> VerifyBeforeMoveTickets(MoveTicketRequest request)
    {
        var validateCriteria = new ValidateEventCriteria
        {
            MatchId = request.MatchId,
            Action = ActionType.MoveTicket,
            SpName = "NAP_Admin_Settlement_50_MoveTicket",
            Mode = "50"
        };

        await repository.ExecuteAsync(validateCriteria);
        return new Result
        {
            ErrCode = validateCriteria.ErrCode,
            ErrMsg = validateCriteria.ErrMsg
        };
    }

    private async Task<MoveTicketInfo> GetTickets(int matchId)
    {
        var criteria = new GetMoveTicketInfoCriteria { MatchId = matchId };
        return await repository.GetAsync<MoveTicketInfo>(criteria);
    }

    private async Task<Result> ExecuteMoveTicket(MoveTicketRequest request, MoveTicketInfo getTickets)
    {
        var criteria = new MoveTicketCriteria
        {
            MatchId = request.MatchId,
            AdminId = currentSession.UserId,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            EventDate = getTickets.EventDate,
            ChildMatchId = getTickets.ChildMatchId,
            Resources = getTickets.Resources
        };

        var tasks = appSettingsKey.SiteDbServer.Select(s => MoveTicket(s, criteria)).ToList();
        var watch = new System.Diagnostics.Stopwatch();
        watch.Start();
        var results = await Task.WhenAll(tasks.ToArray());
        watch.Stop();

        return await HandleAfterMoveTicketAsync(results, watch.ElapsedMilliseconds.ToString(), request, getTickets);
    }

    private async Task<ResultMoveTicket> MoveTicket(string dbServer, MoveTicketCriteria criteria)
    {
        criteria.DbServer = dbServer;
        await repository.ExecuteAsync(criteria);

        return new ResultMoveTicket
        {
            ErrMsg = criteria.ErrMsg,
            ErrCode = criteria.ErrCode,
            TicketCount = criteria.TicketCount
        };
    }

    private async Task<Result> HandleAfterMoveTicketAsync(ResultMoveTicket[] results, string duration, MoveTicketRequest request, MoveTicketInfo getTickets)
    {
        var resultFailed = results.Where(r => r.ErrCode > 0).ToList();
        var notExistTicketMoved = !results.ToList().Exists(r => r.TicketCount > 0);
        if (resultFailed.Any())
        {
            await logService.ActionLog(request.MatchId, resultFailed[0].ErrMsg, ActionIdMoveTicketFailed);
            return resultFailed[0];
        }

        if (notExistTicketMoved)
        {
            await logService.ActionLog(request.MatchId, NotExistValidTicketToMove, ActionIdMoveTicketFailed);
            return new Result { ErrMsg = NotExistValidTicketToMove, ErrCode = NotExistValidTicketToMoveCode };
        }

        var logMessage = $"{getTickets.ChildMatchId}<br/> ({getTickets.Resources})<br/>Duration:{duration}ms; TC:{results.Select(r => r.TicketCount).Sum()}";
        WriteLog(request.MatchId, getTickets.ChildMatchId, getTickets.Resources);
        await logService.ActionLog(request.MatchId, logMessage, ActionIdMoveTicket);
        await UpdateChildMatchInfo(getTickets.ChildMatchId);

        return results[0];
    }

    private async Task UpdateChildMatchInfo(int childMatchId)
    {
        var updateChildMatchCriteria = new UpdateChildMatchCriteria { MatchId = childMatchId };
        await repository.ExecuteAsync(updateChildMatchCriteria);

        var updateChildMatchRemarkCriteria = new UpdateChildMatchRemarkCriteria { MatchId = childMatchId };
        await repository.ExecuteAsync(updateChildMatchRemarkCriteria);
    }

    private void WriteLog(int matchId, int childMatchId, string resources)
    {
        var messageLog = $"Move ticket of matchId: {matchId} into child match: {childMatchId}, Settled Results: {resources}";

        logService.WriteLog(matchId, messageLog);
    }
}