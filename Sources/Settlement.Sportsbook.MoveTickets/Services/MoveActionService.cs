namespace Settlement.Sportsbook.MoveTickets.Services;

using Criteria;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Models;
using Settlement.Core.Models;
using Settlement.Core.Services;

public interface MoveActionService
{
    Task<Result> MoveTicket(MoveTicketCriteria criteria);
}

public class MoveActionServiceImp : MoveActionService
{
    private const int ActionIdMoveTicket = 81026;
    private const string ActionMoveTicket = "MoveTicket";
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

    public async Task<Result> MoveTicket(MoveTicketCriteria criteria)
    {
        criteria.AdminId = currentSession.UserId;
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();

        var result = await VerifyBeforeMoveTickets(criteria);
        if (result.ErrCode > 0)
        {
            logService.ActionLog(criteria.MatchId, result.ErrMsg, ActionIdMoveTicket);
            return result;
        }

        WriteLog(criteria.MatchId, criteria.ChildMatchId, criteria.Resources);

        var childMatchId = await ExecuteMultiServer(criteria);

        await UpdateChildMatchInfo(childMatchId);

        return result;
    }

    private async Task<Result> VerifyBeforeMoveTickets(MoveTicketCriteria criteria)
    {
        var validateRequest = new EventTicketRequest
        {
            MatchId = criteria.MatchId,
            Action = ActionMoveTicket,
            SpName = criteria.SpName,
            Mode = "50"
        };

        var resultMessage = await scaleOutSettleService.ValidateEventAndTicket(validateRequest);
        return new Result
        {
            ErrCode = resultMessage.ErrorCode,
            ErrMsg = resultMessage.ErrorMessage
        };
    }

    private async Task<int> ExecuteMultiServer(MoveTicketCriteria criteria)
    {
        var getMoveTicketInfoCriteria = new GetMoveTicketInfoCriteria { MatchId = criteria.MatchId };
        var moveTicketInfo = await repository.GetAsync<MoveTicketInfo>(getMoveTicketInfoCriteria);
        criteria.EventDate = moveTicketInfo.EventDate;
        criteria.ChildMatchId = moveTicketInfo.ChildMatchId;
        criteria.Resources = moveTicketInfo.Resources;

        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
        }

        return moveTicketInfo.ChildMatchId;
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