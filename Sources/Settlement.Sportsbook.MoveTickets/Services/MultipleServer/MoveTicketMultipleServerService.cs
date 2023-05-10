namespace Settlement.Sportsbook.MoveTickets.Services.MultipleServer;

using AutoMapper;
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

public interface MoveTicketMultipleServerService
{
    Task<Result> MoveTicket(MoveTicketRequest request);

    Task<Result> MoveRunningTickets(MoveRunningTicketsRequest request);

    Task<Result> ValidateMovingRunningTickets(ValidateMatchesRequest request);
}

public class MoveTicketMultipleServerServiceImp : MoveTicketMultipleServerService
{
    private const int ActionIdMoveTicket = 81026;
    private const int ActionIdMoveRunningTickets = 81035;
    private const string ActionMoveTicket = "MoveTicket";
    private const string ModeRunningTicket = "43";
    private readonly IDynamicRepository repository;
    private readonly IMapper mapper;
    private readonly INapSession currentSession;
    private readonly IHttpContextAccessor accessor;
    private readonly ILogService logService;
    private readonly AppSettingsKey appSettingsKey;
    private readonly ScaleOutSettleService scaleOutSettleService;
    private readonly LogDirectlyService logDirectlyService;

    public MoveTicketMultipleServerServiceImp(
        IDynamicRepository repository,
        IMapper mapper,
        INapSession currentSession,
        IHttpContextAccessor accessor,
        ILogService logService,
        IOptions<AppSettingsKey> appSettingsKey,
        ScaleOutSettleService scaleOutSettleService,
        LogDirectlyService logDirectlyService)
    {
        this.repository = repository;
        this.mapper = mapper;
        this.currentSession = currentSession;
        this.accessor = accessor;
        this.logService = logService;
        this.appSettingsKey = appSettingsKey.Value;
        this.scaleOutSettleService = scaleOutSettleService;
        this.logDirectlyService = logDirectlyService;
    }

    public async Task<Result> MoveTicket(MoveTicketRequest request)
    {
        var criteria = mapper.Map<MoveTicketRequest, MoveTicketCriteria>(request);
        criteria.AdminId = currentSession.UserId;
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
        var validateRequest = new EventTicketRequest
        {
            MatchId = criteria.MatchId,
            Action = ActionMoveTicket,
            SpName = criteria.SpName,
            Mode = "50"
        };

        var resultMessage = await scaleOutSettleService.ValidateEventAndTicket(validateRequest);
        if (resultMessage.ErrorCode > 0)
        {
            logService.ActionLog(request.MatchId, resultMessage.ErrorMessage, ActionIdMoveTicket);
            return new Result
            {
                ErrCode = resultMessage.ErrorCode,
                ErrMsg = resultMessage.ErrorMessage
            };
        }

        var getMoveTicketInfoCriteria = new GetMoveTicketInfoCriteria { MatchId = request.MatchId };
        var moveTicketInfo = await repository.GetAsync<MoveTicketInfo>(getMoveTicketInfoCriteria);
        criteria.EventDate = moveTicketInfo.EventDate;
        criteria.ChildMatchId = moveTicketInfo.ChildMatchId;
        criteria.Resources = moveTicketInfo.Resources;

        //TODO
        var messageLog =
            $"Move ticket of matchid: {criteria.MatchId} into child match: {criteria.ChildMatchId}, Settled Results: {criteria.Resources}";
        logDirectlyService.WriteLog(criteria.MatchId, messageLog);

        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
        }

        var updateChildMatchCriteria = new UpdateChildMatchCriteria { MatchId = moveTicketInfo.ChildMatchId };
        await repository.ExecuteAsync(updateChildMatchCriteria);
        var updateChildMatchRemarkCriteria = new UpdateChildMatchRemarkCriteria { MatchId = moveTicketInfo.ChildMatchId };

        await repository.ExecuteAsync(updateChildMatchRemarkCriteria);

        return new Result
        {
            ErrCode = resultMessage.ErrorCode,
            ErrMsg = resultMessage.ErrorMessage
        };
    }

    public async Task<Result> MoveRunningTickets(MoveRunningTicketsRequest request)
    {
        var criteria = mapper.Map<MoveRunningTicketsRequest, MoveRunningTicketsCriteria>(request);
        criteria.AdminId = currentSession.UserId;
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
        var validateResult = await VerifyBeforeMovingRunningTickets(criteria);
        if (validateResult.ErrCode != 0)
        {
            logService.ActionLog(request.MatchId, validateResult.ErrMsg, ActionIdMoveRunningTickets);
            return validateResult;
        }

        ExecuteMoveRunningTicket(criteria);

        return validateResult;
    }

    private void ExecuteMoveRunningTicket(MoveRunningTicketsCriteria criteria)
    {
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            repository.Execute(criteria);
        }

        var copyResultCriteria = new CopyResultCriteria
        {
            MatchId = criteria.MatchId,
            AdminId = criteria.AdminId,
            IsOverrideResult = criteria.IsOverrideResult,
            DestinationMatchId = criteria.DestinationMatchId
        };

        repository.Execute(copyResultCriteria);
    }

    private async Task<Result> VerifyBeforeMovingRunningTickets(MoveRunningTicketsCriteria criteria)
    {
        var request = new EventTicketRequest
        {
            MatchId = criteria.MatchId,
            Action = ActionMoveTicket,
            SpName = criteria.SpName,
            Mode = ModeRunningTicket,
            DestinationMatchId = criteria.DestinationMatchId
        };
        var resultMessage = await scaleOutSettleService.ValidateEventAndTicket(request);
        return new Result
        {
            ErrCode = resultMessage.ErrorCode,
            ErrMsg = resultMessage.ErrorMessage
        };
    }

    public async Task<Result> ValidateMovingRunningTickets(ValidateMatchesRequest request)
    {
        var criteria = mapper.Map<ValidateMatchesRequest, ValidateMatchesCriteria>(request);

        await repository.ExecuteAsync(criteria);

        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg
        };
    }
}