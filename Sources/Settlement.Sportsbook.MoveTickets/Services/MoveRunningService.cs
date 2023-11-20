namespace Settlement.Sportsbook.MoveTickets.Services;

using AutoMapper;
using Criteria;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Requests;
using Settlement.Core.Models;
using Settlement.Core.Services;

public interface MoveRunningService
{
    Task<Result> MoveRunningTickets(MoveRunningTicketsRequest request);

    Task<Result> ValidateMovingRunningTickets(ValidateMatchesRequest request);
}

public class MoveRunningServiceImp : MoveRunningService
{
    private const int ActionIdMoveRunningTickets = 81035;
    private const string ActionMoveTicket = "MoveTicket";
    private const string ModeRunningTicket = "43";
    private readonly IDynamicRepository repository;
    private readonly IMapper mapper;
    private readonly INapSession currentSession;
    private readonly IHttpContextAccessor accessor;
    private readonly LogService logService;
    private readonly AppSettingsKey appSettingsKey;
    private readonly ScaleOutSettleService scaleOutSettleService;

    public MoveRunningServiceImp(
        IDynamicRepository repository,
        IMapper mapper,
        INapSession currentSession,
        IHttpContextAccessor accessor,
        LogService logService,
        IOptions<AppSettingsKey> appSettingsKey,
        ScaleOutSettleService scaleOutSettleService)
    {
        this.repository = repository;
        this.mapper = mapper;
        this.currentSession = currentSession;
        this.accessor = accessor;
        this.logService = logService;
        this.appSettingsKey = appSettingsKey.Value;
        this.scaleOutSettleService = scaleOutSettleService;
    }

    public async Task<Result> MoveRunningTickets(MoveRunningTicketsRequest request)
    {
        var criteria = mapper.Map<MoveRunningTicketsRequest, MoveRunningTicketsCriteria>(request);
        criteria.AdminId = currentSession.UserId;
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
        var validateResult = await VerifyBeforeMovingRunningTickets(criteria);
        if (validateResult.ErrCode > 0)
        {
            await logService.ActionLog(request.MatchId, validateResult.ErrMsg, ActionIdMoveRunningTickets);
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