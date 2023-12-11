using AutoMapper;
using Fanex.Settlement.ScaleOut.Constants;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.FastMarkets.Constants;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;

namespace Settlement.FastMarkets.Services;

public interface IFastMarketService
{
    Task<FastMarketModel> Query(int matchId);

    Task<Result> Calculate(SettleRequest request);

    Task<List<FastMarketResult>> GetLatestResult(GetLatestResultRequest request);

    Task<List<TimeMachineResult>> GetTimeMachineResult(GetTimeMachineResultRequest request);

    Task InsertMessageToLetstalk(InsertMessageRequest request);
}

public class FastMarketServiceImp : IFastMarketService
{
    private readonly IDynamicRepository repository;

    private readonly IMapper mapper;

    private readonly MultipleServerFetcherService multipleServerFetcherService;

    private readonly AppSettingsKey appSettingsKey;

    private readonly GenerationService generationService;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly LogService logService;

    public FastMarketServiceImp(
        IDynamicRepository repository,
        IMapper mapper,
        MultipleServerFetcherService multipleServerFetcherService,
        IOptions<AppSettingsKey> appSettingsKey,
        ScaleOutSettleService scaleOutSettleService,
        GenerationService generationService,
        LogService logService)
    {
        this.repository = repository;
        this.mapper = mapper;
        this.multipleServerFetcherService = multipleServerFetcherService;
        this.appSettingsKey = appSettingsKey.Value;
        this.scaleOutSettleService = scaleOutSettleService;
        this.generationService = generationService;
        this.logService = logService;
    }

    public async Task<FastMarketModel> Query(int matchId)
    {
        var criteria = new GetFastMarketMatchDetailCriteria { MatchId = matchId };

        var mappingTypes = new[] { typeof(EventCounter), typeof(string), typeof(FastMarketResult), typeof(ResultDetail) };
        var fetchedData = await repository.FetchMultipleAsync(criteria, mappingTypes);
        var eventCounter = fetchedData[0].Cast<EventCounter>().ToList();
        var handicapValue = fetchedData[1].Cast<string>().FirstOrDefault();
        var fastMarketResult = fetchedData[2].Cast<FastMarketResult>().ToList();
        var resultDetail = fetchedData[3].Cast<ResultDetail>().ToList();

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

        var message = $"NAP: Fast Market {criteria.Action} for matchId: {criteria.MatchId}";
        await logService.WriteLog(criteria.MatchId, message);

        ExecuteCalculate(criteria);

        return new Result();
    }

    private void ExecuteCalculate(PushFastMarketResultCriteria criteria)
    {
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            repository.Execute(criteria);
        }
    }

    public async Task<List<FastMarketResult>> GetLatestResult(GetLatestResultRequest request)
    {
        var criteria = new GetFastMarketMatchDetailCriteria { MatchId = request.MatchId };

        var mappingTypes = new[] { typeof(EventCounter), typeof(string), typeof(FastMarketResult), typeof(ResultDetail) };
        var fetchedData = await repository.FetchMultipleAsync(criteria, mappingTypes);
        var result = fetchedData[2].Cast<FastMarketResult>().ToList();

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
        var criteria = new GetMatchDetailCriteria { MatchId = matchId };
        var matchDetail = await repository.GetAsync<Models.MatchDetail>(criteria);
        var settingMatch = Convert.ToString(matchDetail.AutoSetting, convertToBase).Reverse();

        return !string.IsNullOrWhiteSpace(settingMatch) && settingMatch.Length > 2 && settingMatch[2].Equals('1');
    }
}