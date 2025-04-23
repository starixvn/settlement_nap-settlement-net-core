using AutoMapper;
using Fanex.Settlement.MessageBridge.Constants;
using Fanex.Settlement.ScaleOut.Constants;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;
using ILogService = Settlement.Core.Services.LogService;
using LogService = Fanex.Logging.LogService;
using ResourceItem = Fanex.Settlement.MessageBridge.ResultAmendment.ResourceItem;
using TicketStatus = Settlement.FastMarkets.Constants.TicketStatus;

namespace Settlement.FastMarkets.Services;

public interface IFastMarketService
{
    Task<FastMarketModel> Query(int matchId);

    Task<Result> Calculate(SettleRequest request);

    Task<List<FastMarketResult>> GetLatestResult(GetLatestResultRequest request);

    Task<List<TimeMachineResult>> GetTimeMachineResult(GetTimeMachineResultRequest request);

    Task InsertMessageToLetstalk(InsertMessageRequest request);

    Task<List<TimeMachineResult>> GetOuTimeMachineResult(GetOuTimeMachineResultRequest request);
}

public class FastMarketServiceImp(
    IDynamicRepository repository,
    IMapper mapper,
    MultipleServerFetcherService multipleServerFetcherService,
    IOptions<AppSettingsKey> appSettingsKey,
    ScaleOutSettleService scaleOutSettleService,
    GenerationService generationService,
    ILogService logService,
    IFastMarketResultAmendmentService fastMarketResultAmendmentService,
    XmlConvertService xmlConvertService)
    : IFastMarketService
{
    private readonly AppSettingsKey appSettingsKey = appSettingsKey.Value;

    public async Task<FastMarketModel> Query(int matchId)
    {
        var criteria = new GetFastMarketMatchDetailCriteria { MatchId = matchId };

        var fetchedData = await repository.FetchMultipleAsync<EventCounter, string, FastMarketResult, ResultDetail>(criteria);
        var eventCounter = fetchedData.Item1.ToList();
        var handicapValue = fetchedData.Item2.FirstOrDefault();
        var fastMarketResult = fetchedData.Item3.ToList();
        var resultDetail = fetchedData.Item4.ToList();

        var (fastMarketTicketDetails, ticketsCount) = await multipleServerFetcherService.GetFastMarketTicketDetail(matchId);
        MergeFastMarketTicketsToResults(fastMarketResult, fastMarketTicketDetails);
        var groupFastMarketByBetType = generationService.BetTypesList(fastMarketResult, handicapValue);

        return new FastMarketModel
        {
            MatchId = matchId,
            EventCounters = eventCounter,
            HandicapValue = handicapValue,
            BetTypes = groupFastMarketByBetType,
            TicketCount = ticketsCount,
            ResultDetail = resultDetail
        };
    }

    private static void MergeFastMarketTicketsToResults(List<FastMarketResult> fastMarketResults, List<FastMarketResult> fastMarketTicketDetails)
    {
        var newTicketDetails = fastMarketTicketDetails.Where(ticketDetail => !fastMarketResults.Exists(result => result.Equals(ticketDetail)));
        fastMarketResults.AddRange(newTicketDetails);
        GenerateTicketsStatus(fastMarketResults, fastMarketTicketDetails);
    }

    private static void GenerateTicketsStatus(List<FastMarketResult> fastMarketResults, List<FastMarketResult> fastMarketTicketDetails)
    {
        foreach (var result in fastMarketResults)
        {
            var ticketDetail = fastMarketTicketDetails.Find(detail => detail.BetType == result.BetType && detail.Position == result.Position);
            result.TicketStatus = CreateTicketStatus(ticketDetail);
        }
    }

    private static int CreateTicketStatus(FastMarketResult ticketDetail)
    {
        if (ticketDetail == null || ticketDetail.TicketCount == 0)
        {
            return TicketStatus.NoTicket;
        }

        if (ticketDetail.TicketRunning > 0)
        {
            return TicketStatus.Running;
        }

        return ticketDetail.TicketMarked > 0 ? TicketStatus.Marked : TicketStatus.Calculated;
    }

    public async Task<Result> Calculate(SettleRequest request)
    {
        var criteria = await generationService.QuerySettle(request);

        var validationRequest = mapper.Map<PushFastMarketResultCriteria, EventTicketFastMarketRequest>(criteria);

        var validationResult = await scaleOutSettleService.ValidateEventAndTicketFastMarket(validationRequest);
        if (validationResult.ErrorCode > 0)
        {
            return new Result
            {
                ErrCode = validationResult.ErrorCode,
                ErrMsg = validationResult.ErrorMessage
            };
        }
        var requestUpdateInfo = new UpdateMatchInfoRequest
        {
            MatchId = criteria.MatchId,
            Action = criteria.Action,
            AdminId = criteria.AdminId,
            Results = criteria.Results,
            EventCounters = criteria.EventCounters,
            Mode = Mode.FastMarket,
            IsSettleDetermined = criteria.IsSettleDetermined
        };

        await scaleOutSettleService.UpdateMatchInfo(requestUpdateInfo);

        await WriteLog(criteria);

        ExecuteCalculate(criteria);

        return new Result
        {
            SettledSessionId = criteria.BroadcastSessionId,
            IsOrg = true
        };
    }

    private void ExecuteCalculate(PushFastMarketResultCriteria criteria)
    {
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            repository.Execute(criteria);
        }
    }

    private async Task WriteLog(PushFastMarketResultCriteria criteria)
    {
        var resourceRoot = new Resources<ResourceItem>
        {
            ResourceItems = criteria.SelectedResources.ToList()
        };
        var selectedResources = xmlConvertService.Serialize(resourceRoot);

        var insertLogCriteria = mapper.Map<InsertLogCriteria>(criteria);
        insertLogCriteria.SelectedResources = selectedResources;
        insertLogCriteria.Sporttype = SportType.Soccer;
        insertLogCriteria.Mode = ResultAmendmentType.FastMarket;
        var message = $"NAP: Fast Market {criteria.Action} for matchId: {criteria.MatchId}";

        await logService.WriteLog(insertLogCriteria);
        await logService.WriteLog(criteria.MatchId, message);

        await UpdateResultAmendment(criteria, selectedResources);
    }

    private async Task UpdateResultAmendment(PushFastMarketResultCriteria request, string selectedResources)
    {
        try
        {
            if (request.Action == ActionName.Undo)
            {
                return;
            }

            var resettleResult = await fastMarketResultAmendmentService.GetResultChanged(request, selectedResources);
            var verifyResettleResult = ResultAmendmentCoreService.CheckReSettleTicket(resettleResult, request.Action);
            if (verifyResettleResult.Any())
            {
                await fastMarketResultAmendmentService.PublishResultAmendment(request, request.SelectedResources, resettleResult);
            }
        }
        catch (Exception ex)
        {
            await LogService.ErrorAsync("ResultAmendmentService", ex);
        }
    }

    public async Task<List<FastMarketResult>> GetLatestResult(GetLatestResultRequest request)
    {
        var criteria = new GetFastMarketMatchDetailCriteria { MatchId = request.MatchId };

        var fetchedData = await repository.FetchMultipleAsync<EventCounter, string, FastMarketResult, ResultDetail>(criteria);
        var result = fetchedData.Item3.ToList();

        return result;
    }

    public async Task<List<TimeMachineResult>> GetTimeMachineResult(GetTimeMachineResultRequest request)
    {
        var criteria = mapper.Map<GetTimeMachineResultRequest, GetTimeMachineResultCriteria>(request);
        var result = await repository.FetchAsync<TimeMachineResult>(criteria);

        return result.ToList();
    }

    public async Task InsertMessageToLetstalk(InsertMessageRequest request)
    {
        var isOnAuto = await IsOnAutoSettle(request.MatchId);
        if (isOnAuto)
        {
            return;
        }

        var (_, ticketsCount) = await multipleServerFetcherService.GetFastMarketTicketDetail(request.MatchId);
        if (ticketsCount.BetRunningCount > 0)
        {
            const string message = "The match has been completed at @latest_settle_time with Auto-Settle FM turned OFF";
            var criteria = new AddNotificationCriteria
            {
                MatchId = request.MatchId,
                UserId = request.UserId,
                ActionName = request.ActionName,
                MessageContent = message
            };
            await repository.ExecuteAsync(criteria);
        }
    }

    private async Task<bool> IsOnAutoSettle(int matchId)
    {
        const int convertToBase = 2;
        const int autoSettlePosition = 2;
        var criteria = new GetMatchDetailCriteria { MatchId = matchId };
        var matchDetail = await repository.GetAsync<Models.MatchDetail>(criteria);
        var settingMatch = Convert.ToString(matchDetail.AutoSetting, convertToBase).Reverse();

        return !string.IsNullOrWhiteSpace(settingMatch) && settingMatch.Length > 2 && settingMatch[autoSettlePosition].Equals('1');
    }

    public async Task<List<TimeMachineResult>> GetOuTimeMachineResult(GetOuTimeMachineResultRequest request)
    {
        var criteria = mapper.Map<GetOuTimeMachineResultCriteria>(request);
        var result = await repository.FetchAsync<TimeMachineResult>(criteria);

        return result.ToList();
    }
}