using Settlement.Core.Constants;

namespace Settlement.Sportsbook.MoveTickets.Services;

using Criteria;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Models;
using Requests;
using Settlement.Core.Models;
using Settlement.Core.Services;

public interface MoveActionService
{
    Task<Result> MoveTicket(MoveTicketRequest request);
}

public class MoveActionServiceImp : MoveActionService
{
    private const int ActionIdMoveTicket = 81026;
    private readonly IDynamicRepository repository;
    private readonly INapSession currentSession;
    private readonly IHttpContextAccessor accessor;
    private readonly LogService logService;
    private readonly AppSettingsKey appSettingsKey;
    private readonly ScaleOutSettleService scaleOutSettleService;

    public MoveActionServiceImp(
        IDynamicRepository repository,
        INapSession currentSession,
        IHttpContextAccessor accessor,
        LogService logService,
        IOptions<AppSettingsKey> appSettingsKey,
        ScaleOutSettleService scaleOutSettleService)
    {
        this.repository = repository;
        this.currentSession = currentSession;
        this.accessor = accessor;
        this.logService = logService;
        this.appSettingsKey = appSettingsKey.Value;
        this.scaleOutSettleService = scaleOutSettleService;
    }

    public async Task<Result> MoveTicket(MoveTicketRequest request)
    {
        var result = await VerifyBeforeMoveTickets(request);
        if (result.ErrCode > 0)
        {
            logService.ActionLog(request.MatchId, result.ErrMsg, ActionIdMoveTicket);
            return result;
        }

        var getTickets = await GetTickets(request.MatchId);
        WriteLog(request.MatchId, getTickets.ChildMatchId, getTickets.Resources);

        await ExecuteMoveTicket(request, getTickets);

        await UpdateChildMatchInfo(getTickets.ChildMatchId);

        return result;
    }

    private async Task<Result> VerifyBeforeMoveTickets(MoveTicketRequest request)
    {
        var validateRequest = new EventTicketRequest
        {
            MatchId = request.MatchId,
            Action = ActionType.MoveTicket,
            SpName = "NAP_Admin_Settlement_50_MoveTicket",
            Mode = "50"
        };

        var resultMessage = await scaleOutSettleService.ValidateEventAndTicket(validateRequest);
        return new Result
        {
            ErrCode = resultMessage.ErrorCode,
            ErrMsg = resultMessage.ErrorMessage
        };
    }

    private async Task<MoveTicketInfo> GetTickets(int matchId)
    {
        var criteria = new GetMoveTicketInfoCriteria { MatchId = matchId };
        return await repository.GetAsync<MoveTicketInfo>(criteria);
    }

    private async Task ExecuteMoveTicket(MoveTicketRequest request, MoveTicketInfo getTickets)
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

        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
        }
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