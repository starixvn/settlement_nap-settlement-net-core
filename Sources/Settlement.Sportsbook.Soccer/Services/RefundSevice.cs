using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services;

public interface IRefundService
{
    Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsCriteria criteria);

    Task<Result> MoveThirdPartyBetTickets(MoveThirdPartyBetTicketCriteria criteria);

    Task<Result> Refund(RefundRequest request);

    Task<Result> RefundRunningThirdPartyTickets(RefundRunningThirdPartyTicketRequest request);
}

public class RefundServiceImp(
    IDynamicRepository repository,
    IHttpContextAccessor accessor,
    IOptions<AppSettingsKey> appSettingsKey,
    ICreateCriteriaService createCriteriaService,
    ScaleOutSettleService scaleOutSettleService,
    LogService logService)
    : IRefundService
{
    public async Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsCriteria criteria)
    {
        foreach (var server in appSettingsKey.Value.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
            if (criteria.IsExistMarkedTicket)
            {
                return new MarkedTickets
                {
                    IsExistMarkedTicket = criteria.IsExistMarkedTicket
                };
            }
        }

        return new MarkedTickets();
    }

    public async Task<Result> Refund(RefundRequest request)
    {
        var criteria = createCriteriaService.CreateRefundCriteria(request);
        criteria.SdtRecord = SettleDetermineTicket(request);
        var validationResult = await ValidateBeforeExecute(criteria);
        if (validationResult.ErrCode > 0)
        {
            return validationResult;
        }

        var insertLogCriteria = createCriteriaService.CreateRefundLogCriteria(request);
        await WriteLog(criteria, insertLogCriteria);

        await ExecuteRefund(criteria);

        await RefundHedgeMatch(request, criteria);

        return validationResult;
    }

    private async Task RefundHedgeMatch(RefundRequest request, RefundCriteria criteria)
    {
        if (request.IsApplyHedging)
        {
            if (!request.ActionName.Equals(ActionType.RefundHalfTime) && !request.IsDeterminedHedgeMatch)
            {
                request.IsSettleAbandonedMatchIbc = false;
                criteria.SdtRecord = SettleDetermineTicket(request);
                criteria.ResourceResult = string.Empty;
            }

            criteria.MatchId = request.HedgeMatchId;
            await ExecuteRefund(criteria);
        }
    }

    private static byte SettleDetermineTicket(RefundRequest request)
    {
        var dictionary = new Dictionary<int, bool>
        {
            { 1, request.IsSettleAbandonedMatchBetDaq},
            { 2, request.IsSettleAbandonedMatchBetFair },
            { 4, request.IsSettleAbandonedMatchIbc },
            { 8, request.ExcludeTicketBetDaqInRefund },
            { 16, request.ExcludeTicketBetFairInRefund }
        };

        var value = dictionary.Where(item => item.Value).Sum(item => item.Key);

        return (byte)value;
    }

    private async Task<Result> ValidateBeforeExecute(RefundCriteria criteria)
    {
        var request = createCriteriaService.CreateEventTicketReturnRequest(criteria);
        var resultMessage = await scaleOutSettleService.ValidateEventAndTicket(request);
        return new Result
        {
            ErrCode = resultMessage.ErrorCode,
            ErrMsg = resultMessage.ErrorMessage
        };
    }

    private async Task UpdateMatchInfo(RefundCriteria criteria)
    {
        await scaleOutSettleService.UpdateUnderSettlementFlag(criteria.MatchId, criteria.AdminId, criteria.Action);
        var requestUpdateInfo = new UpdateMatchInfoRequest
        {
            MatchId = criteria.MatchId,
            Action = criteria.Action,
            AdminId = criteria.AdminId,
            BetStatus = criteria.BetStatus,
            FullTimeAway = criteria.FullTimeAway,
            FullTimeHome = criteria.FullTimeHome,
            HalfTimeAway = criteria.HalfTimeAway ?? 0,
            HalfTimeHome = criteria.HalfTimeHome ?? 0,
            ResourceResult = criteria.ResourceResult,
            SDTRecord = criteria.SdtRecord,
            GoalRecord = criteria.GoalSequence
        };

        await scaleOutSettleService.UpdateMatchInfo(requestUpdateInfo);
    }

    private async Task ExecuteRefund(RefundCriteria criteria)
    {
        await UpdateMatchInfo(criteria);

        foreach (var server in appSettingsKey.Value.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
        }
    }

    private async Task WriteLog(RefundCriteria criteria, InsertLogCriteria insertLogCriteria)
    {
        await logService.WriteLog(insertLogCriteria);

        var messageLog = $"NAP: Calculate {criteria.Action} for matchId:{criteria.MatchId} "
                         + $"score FT: {criteria.FullTimeHome}-{criteria.FullTimeAway} "
                         + $"HT: {criteria.HalfTimeHome}-{criteria.HalfTimeAway} "
                         + (!string.IsNullOrEmpty(criteria.GoalSequence) ? "GoalRecord:" + criteria.GoalSequence : string.Empty)
                         + $" SDTRecord: {criteria.SdtRecord} "
                         + (!string.IsNullOrEmpty(criteria.BetStatus) ? $"Remark({criteria.BetStatus})" : string.Empty);

        await logService.WriteLog(criteria.MatchId, messageLog);
    }

    public async Task<Result> RefundRunningThirdPartyTickets(RefundRunningThirdPartyTicketRequest request)
    {
        var criteria = new RefundRunningThirdPartyTicketCriteria
        {
            ActionName = request.ActionName,
            MatchId = request.MatchId,
            AdminId = request.AdminId,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString()
        };

        var result = await VerifyBeforeRefundRunningTickets(request.MatchId, request.ActionName, criteria.SpName);
        if (result.ErrCode > 0)
        {
            return result;
        }

        await WriteLogDirectly(request);

        foreach (var server in appSettingsKey.Value.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
        }

        return result;
    }

    private async Task<Result> VerifyBeforeRefundRunningTickets(int matchId, string actionName, string spName)
    {
        var validationRequest = new EventTicketRequest
        {
            MatchId = matchId,
            Action = actionName,
            SpName = spName,
            Mode = ActionType.RefundAll
        };

        var resultMessage = await scaleOutSettleService.ValidateEventAndTicket(validationRequest);
        return new Result
        {
            ErrCode = resultMessage.ErrorCode,
            ErrMsg = resultMessage.ErrorMessage
        };
    }

    public async Task<Result> MoveThirdPartyBetTickets(MoveThirdPartyBetTicketCriteria criteria)
    {
        var spName = criteria.ActionName.IgnoreCaseEquals(ActionType.BetDaq) ? "NAP_Admin_Settlement_BetDaq_Move" : "NAP_Admin_Settlement_BetFair_Move";
        var result = await VerifyBeforeMoveBetTickets(criteria, spName);
        if (result.ErrCode > 0)
        {
            return result;
        }

        await WriteLogDirectlyMoveTicket(criteria);

        await ExecuteMoveBetTickets(criteria, spName);

        return result;
    }

    private async Task ExecuteMoveBetTickets(MoveThirdPartyBetTicketCriteria criteria, string spName)
    {
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
        criteria.SpName = spName;
        foreach (var server in appSettingsKey.Value.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
        }
    }

    private async Task<Result> VerifyBeforeMoveBetTickets(MoveThirdPartyBetTicketCriteria criteria, string spName)
    {
        var validationRequest = new EventTicketRequest
        {
            MatchId = criteria.MatchId,
            DestinationMatchId = criteria.NewMatchId,
            Action = "MoveTicket",
            SpName = spName,
            Mode = criteria.ActionName
        };

        var resultMessage = await scaleOutSettleService.ValidateEventAndTicket(validationRequest);
        return new Result
        {
            ErrCode = resultMessage.ErrorCode,
            ErrMsg = resultMessage.ErrorMessage
        };
    }

    private async Task WriteLogDirectly(RefundRunningThirdPartyTicketRequest request)
    {
        var action = request.ActionName == ActionType.BetDaq ? "BetDaq" : "BetFair";
        var message = $"NAP: Calculate (Refund Running {action}) for matchId: {request.MatchId}";
        await logService.WriteLog(request.MatchId, message);
    }

    private async Task WriteLogDirectlyMoveTicket(MoveThirdPartyBetTicketCriteria criteria)
    {
        var action = criteria.ActionName == ActionType.BetDaq ? "BetDaq" : "BetFair";
        var message = $"{action} Movement from OldMatch: {criteria.MatchId}, NewMatch: {criteria.NewMatchId}";
        await logService.WriteLog(criteria.MatchId, message);
    }
}