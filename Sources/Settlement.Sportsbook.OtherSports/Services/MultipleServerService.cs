using Fanex.NAP.Client.Helpers.Common;
using Settlement.Core.Criteria;
using Settlement.Core.Services;
using Settlement.Sportsbook.OtherSports.Models;

namespace Settlement.Sportsbook.OtherSports.Services;

using AutoMapper;
using Constants;
using Criteria;
using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Requests;
using Settlement.Core.Constants;
using Settlement.Core.Models;

public interface MultipleServerService
{
    Task<(MatchDetail, List<TicketCounts>)> GetMatchInfo(GetMatchRequest request);

    Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsCriteria criteria);

    Task<Result> Calculate(CalculateCriteria calculateCriteria, ScoreSetModel score);
}

public class MultipleServerServiceImp : MultipleServerService
{
    private readonly IDynamicRepository repository;
    private readonly AppSettingsKey appSettingsKey;
    private readonly MergeDataService mergeDataService;
    private readonly ScaleOutSettleService scaleOutSettleService;
    private readonly LogService logService;
    private readonly IMapper mapper;

    public MultipleServerServiceImp(
        IDynamicRepository repository,
        IOptions<AppSettingsKey> appSettingsKey,
        MergeDataService mergeDataService,
        ScaleOutSettleService scaleOutSettleService,
        LogService logService,
        IMapper mapper)
    {
        this.repository = repository;
        this.appSettingsKey = appSettingsKey.Value;
        this.mergeDataService = mergeDataService;
        this.scaleOutSettleService = scaleOutSettleService;
        this.logService = logService;
        this.mapper = mapper;
    }

    public async Task<(MatchDetail, List<TicketCounts>)> GetMatchInfo(GetMatchRequest request)
    {
        var criteria = new GetSportsbookMatchDetailCriteria
        {
            MatchId = request.MatchId,
            IsRefundPage = request.IsRefundPage
        };

        var fetchedResult = await repository.FetchMultipleAsync<MatchDetail, object>(criteria);
        var matchDetail = fetchedResult.Item1.FirstOrDefault();
        Check.Argument.IsNotNull(matchDetail, $"Match ${criteria.MatchId} does not exist");
        var ticketInfoCriteria = new GetTicketInfoCriteria { MatchId = request.MatchId };
        var multipleTicketCounts = await GetTicketInfo(ticketInfoCriteria);
        var ticketCounts = mergeDataService.MergeTicketCounts(multipleTicketCounts);
        mergeDataService.MergeMatchDetail(matchDetail, ticketCounts);
        mergeDataService.GroupTicketCount(ticketCounts);

        return (matchDetail, ticketCounts);
    }

    private async Task<List<List<TicketCounts>>> GetTicketInfo(GetTicketInfoCriteria criteria)
    {
        var multipleTickets = new List<List<TicketCounts>>();
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            var ticketInfo = await repository.FetchMultipleAsync<object, TicketCounts>(criteria);
            multipleTickets.Add(ticketInfo.Item2.ToList());
        }

        return multipleTickets;
    }

    public async Task<Result> Calculate(CalculateCriteria calculateCriteria, ScoreSetModel score)
    {
        var validateRequest = new EventTicketRequest
        {
            MatchId = calculateCriteria.MatchId,
            Action = calculateCriteria.Action,
            SpName = calculateCriteria.SpName,
            Mode = ActionKey.ActionDictionary[calculateCriteria.Action]
        };

        var requestChecking = await ValidateBeforeExecute(validateRequest);
        if (requestChecking.ErrCode > 0)
        {
            return requestChecking;
        }

        await SetUnderSettleFlag(calculateCriteria.MatchId, calculateCriteria.AdminId, calculateCriteria.Action);

        var requestUpdateInfo = CreateUpdateRequest(calculateCriteria, score);

        await IsHtTicketSettled(requestUpdateInfo);

        await scaleOutSettleService.UpdateMatchInfo(requestUpdateInfo);

        await WriteLog(calculateCriteria);

        foreach (var server in appSettingsKey.SiteDbServer)
        {
            calculateCriteria.DbServer = server;
            await repository.ExecuteAsync(calculateCriteria);
        }

        return requestChecking;
    }

    private async Task WriteLog(CalculateCriteria criteria)
    {
        var insertLogCriteria = mapper.Map<InsertLogCriteria>(criteria);
        await logService.WriteLog(insertLogCriteria);

        var messageLog = $"NAP: Calculate {criteria.Action} for matchId: {criteria.MatchId} Result: {criteria.SelectedResources} <br/> BetStatus ({criteria.BetStatus})";
        await logService.WriteLog(criteria.MatchId, messageLog);
    }

    private static UpdateMatchInfoRequest CreateUpdateRequest(CalculateCriteria criteria, ScoreSetModel score)
    {
        var requestUpdateInfo = new UpdateMatchInfoRequest
        {
            MatchId = criteria.MatchId,
            Action = criteria.Action,
            AdminId = criteria.AdminId,
            BetStatus = criteria.BetStatus,
            HalfTimeHome = score.HtHomeScore ?? 0,
            HalfTimeAway = score.HtAwayScore ?? 0
        };

        if (!criteria.Action.Equals(ActionType.CalculateFullTime) && !criteria.Action.Equals(ActionType.CalculateAll))
        {
            return requestUpdateInfo;
        }
        requestUpdateInfo.FullTimeHome = score.FinalHomeScore ?? 0;
        requestUpdateInfo.FullTimeAway = score.FinalAwayScore ?? 0;

        return requestUpdateInfo;
    }

    private async Task IsHtTicketSettled(UpdateMatchInfoRequest request)
    {
        if (request.Action is ActionType.CalculateFullTime or ActionType.RefundFullTime)
        {
            const int halfTimeGroupId = 1;
            var criteria = new GetTicketInfoCriteria
            {
                MatchId = request.MatchId,
                IsRefundPage = request.Action == ActionType.RefundFullTime
            };
            var multipleTicketCounts = await GetTicketInfo(criteria);
            var ticketCounts = mergeDataService.MergeTicketCounts(multipleTicketCounts);
            var ticketHt = ticketCounts.Find(item => item.GroupId == halfTimeGroupId);
            request.IsHtTicketSettled = ticketHt is { BetRunningCount: 0 };
        }
    }

    private async Task<Result> ValidateBeforeExecute(EventTicketRequest request)
    {
        var resultMessage = await scaleOutSettleService.ValidateEventAndTicket(request);
        return new Result
        {
            ErrCode = resultMessage.ErrorCode,
            ErrMsg = resultMessage.ErrorMessage
        };
    }

    private async Task SetUnderSettleFlag(int matchId, int adminId, string action)
    {
        var actionToSetFlag = new List<string> { ActionType.CalculateAll, ActionType.UnCalculate, ActionType.CalculateFullTime, ActionType.RefundFullTime, ActionType.RefundAll };
        if (actionToSetFlag.Contains(action))
        {
            await scaleOutSettleService.UpdateUnderSettlementFlag(matchId, adminId, action);
        }
    }

    public async Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsCriteria criteria)
    {
        foreach (var server in appSettingsKey.SiteDbServer)
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
}