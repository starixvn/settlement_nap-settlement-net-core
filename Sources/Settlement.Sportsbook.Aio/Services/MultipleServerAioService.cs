using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Criteria.Tennis;
using Settlement.Sportsbook.Aio.Requests;

namespace Settlement.Sportsbook.Aio.Services;

public interface MultipleServerAioService
{
    public Task<(List<Models.ResultDetail>, TicketCounts)> FetchResultDetails(GetResultDetailCriteria criteria, int sportType);

    public Task<MarkedTickets> CheckMarkedTickets(CheckMarkedTicketsRequest request);

    public Task<Result> Settle(SettleRequest request);

    public Task<Result> SettleChildMatch(SettleChildMatchRequest request);
}

public class MultipleServerAioServiceImp(
    IDynamicRepository repository,
    IOptions<AppSettingsKey> appSettingsKey,
    MultipleServerAioServiceDependencies dependencies) : MultipleServerAioService
{
    private readonly ScaleOutSettleService scaleOutSettleService = dependencies.ScaleOutSettleService;
    private readonly ICreateQueryService createQueryService = dependencies.CreateQueryService;
    private readonly MergeDataService mergeDataService = dependencies.MergeDataService;
    private readonly LogService logService = dependencies.LogService;
    private readonly IMapper mapper = dependencies.Mapper;
    private readonly ResultAmendmentService resultAmendmentService = dependencies.ResultAmendmentService;

    public async Task<(List<Models.ResultDetail>, TicketCounts)> FetchResultDetails(GetResultDetailCriteria criteria, int sportType)
    {
        criteria.SportType = sportType;
        var fetchedResultDetails = await repository.FetchAsync<Models.ResultDetail>(criteria);
        var (ticketDetails, ticketCount) = await GetEarlyTicketDetails(criteria);
        var resultDetails = fetchedResultDetails.ToList();
        MergeTicketsToResults(resultDetails, ticketDetails, criteria.SettleType);

        return (resultDetails.Where(result => result.TicketStatus != TicketStatus.NotIncluded).ToList(), ticketCount);
    }

    private static void MergeTicketsToResults(List<Models.ResultDetail> resultDetails, List<Models.ResultDetail> ticketDetails, string settleType)
    {
        var newTicketDetails = ticketDetails.Where(ticketDetail => !resultDetails.Exists(result => result.Equals(ticketDetail)));

        resultDetails.AddRange(newTicketDetails);

        GenerateTicketsStatus(resultDetails, ticketDetails, settleType);
    }

    private static void GenerateTicketsStatus(List<Models.ResultDetail> results, List<Models.ResultDetail> ticketDetails, string settleType)
    {
        foreach (var result in results)
        {
            var ticketDetail = ticketDetails.Find(detail => detail.ResourceId == result.ResourceId);
            result.TicketStatus = CreateTicketStatus(ticketDetail, settleType);
            result.IsSpecialBettype = ticketDetail?.IsSpecialBettype ?? 0;
        }
    }

    private static string CreateTicketStatus(Models.ResultDetail ticketDetail, string settleType)
    {
        if (ticketDetail == null)
        {
            return TicketStatus.NotIncluded;
        }

        if (ticketDetail.BetCount == 0 || ticketDetail.BetCount == ticketDetail.InWaiting)
        {
            return TicketStatus.NoTicket;
        }

        if (ticketDetail.InRunning > 0)
        {
            return TicketStatus.Running;
        }

        if (ticketDetail.BetMarkedCount > 0)
        {
            return TicketStatus.Marked;
        }

        if (ticketDetail.BetSettledCount > 0)
        {
            return TicketStatus.Calculated;
        }

        if (ticketDetail.BetRefundedCount > 0 && settleType != SettleType.Early)
        {
            return TicketStatus.Refunded;
        }

        return TicketStatus.Calculated;
    }

    private async Task<(List<Models.ResultDetail>, TicketCounts)> GetEarlyTicketDetails(GetResultDetailCriteria getResultDetailCriteria)
    {
        var multipleTicketDetails = new List<(List<Models.ResultDetail>, TicketCounts)>();
        var criteria = new GetTicketDetailsCriteria
        {
            MatchId = getResultDetailCriteria.MatchId,
            SettleType = getResultDetailCriteria.SettleType,
            SportType = getResultDetailCriteria.SportType
        };

        foreach (var server in appSettingsKey.Value.SiteDbServer)
        {
            var ticketDetails = await GetTicketDetailsByServer(criteria, server);
            multipleTicketDetails.Add(ticketDetails);
        }

        return dependencies.MergeDataService.MergeTicketDetails(multipleTicketDetails);
    }

    private async Task<(List<Models.ResultDetail>, TicketCounts)> GetTicketDetailsByServer(GetTicketDetailsCriteria criteria, string server)
    {
        criteria.DbServer = server;
        var (ticketDetails, ticketCounts) = await repository.FetchMultipleAsync<Models.ResultDetail, TicketCounts>(criteria);

        return (ticketDetails.ToList(), ticketCounts.FirstOrDefault() ?? new TicketCounts());
    }

    public async Task<MarkedTickets> CheckMarkedTickets(CheckMarkedTicketsRequest request)
    {
        var criteria = new CheckingMarkedTicketsCriteria
        {
            MatchId = request.MatchId,
            ResourceIds = GetResourceIds(request.SelectedResources)
        };

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

    private static string GetResourceIds(List<ResourceItem> betTypes)
    {
        var listResourceId = betTypes.Select(betType => betType.ResourceId).ToList();

        return string.Join(",", listResourceId);
    }

    public async Task<Result> Settle(SettleRequest request)
    {
        var criteria = dependencies.CreateQueryService.QuerySettle(request);
        var result = await Execute(criteria, request.SelectedResources);
        result.SettledSessionId = criteria.BroadcastSessionId;

        int[] sportChildMatches = [SportType.Cricket, SportType.BaseBall];
        if (sportChildMatches.Contains(request.SportType) && result.IsSuccessful)
        {
            var childMatchIds = await GetChildMatchIds(criteria.MatchId, criteria.Action, criteria.SelectedResources);
            result.ChildMatchIds = childMatchIds;
        }

        await HandleRefundGameWinner(request, result);
        await InsIAutoRefundOSChildrenMatch(request);

        return result;
    }

    private async Task HandleRefundGameWinner(SettleRequest request, Result result)
    {
        var isMatchGameWinner = request.SportType == SportType.Tennis && request.ParentId == 0 && result.IsSuccessful;

        if (request.IsSettleRelated && isMatchGameWinner && request.ActionName is ActionType.CalculateAll or ActionType.RefundAll)
        {
            await InsRefundResultOS(request);
        }
    }

    private async Task InsIAutoRefundOSChildrenMatch(SettleRequest request)
    {
        var sportApplied = request.SportType is SportType.TableTennis or SportType.BeachVolleyball;
        var isHasRefundChildMatch = request.IsSettleRelated
            && sportApplied
            && request.ParentId == 0
            && request.ActionName == ActionType.RefundAll;

        if (!isHasRefundChildMatch || string.IsNullOrEmpty(request.ChildMatchIds))
        {
            return;
        }

        var criteria = request.ChildMatchIds.Split(",")
            .Select(x => Convert.ToInt32(x))
            .Select(x => new AutoRefundOSResultInsCriteria
            {
                MatchId = x,
                TypeId = 1, // Refund Single
                ResourceIds = "00"
            }).ToList();

        var tasks = criteria.Select(x => repository.ExecuteAsync(x));
        await Task.WhenAll(tasks);
    }

    private async Task InsRefundResultOS(SettleRequest request)
    {
        var criteria = new InsRefundResultOSCriteria
        {
            MatchId = request.MatchId,
            ResourceIds = string.Join(',', request.SelectedResources.Select(r => r.ResourceId))
        };

        await repository.ExecuteAsync(criteria);
    }

    private async Task SetUnderSettleFlag(SettleCriteria criteria, List<ResourceItem> selectedResources)
    {
        var actionToSetFlag = new List<string> { SettleType.Calculate, SettleType.Undo, SettleType.Refund };
        if (actionToSetFlag.Contains(criteria.Action) && selectedResources.Exists(resource => resource.ResourceId == ResourceType.Final))
        {
            await dependencies.ScaleOutSettleService.UpdateUnderSettlementFlag(criteria.MatchId, criteria.AdminId, criteria.Action);
        }
    }

    private async Task WriteLog(SettleCriteria criteria)
    {
        var insertLogCriteria = dependencies.Mapper.Map<InsertLogCriteria>(criteria);
        await dependencies.LogService.WriteLog(insertLogCriteria);

        var messageLog = $"NAP: Calculate {criteria.Action} for matchId: {criteria.MatchId} Result: {criteria.SelectedResources} <br/> BetStatus ({criteria.BetStatus})";
        await dependencies.LogService.WriteLog(criteria.MatchId, messageLog);
    }

    private async Task<Result> UpdateInfoAndSettle(SettleCriteria criteria, List<ResourceItem> selectedResources)
    {
        await SetUnderSettleFlag(criteria, selectedResources);

        await UpdateMatchInfo(criteria);

        await WriteLog(criteria);

        var isResultAmendment = await HandleResultAmendment(criteria, selectedResources);

        var result = await PushResultSettleAllSites(criteria);

        return new Result
        {
            HasResultAmendment = isResultAmendment,
            ErrCode = result.ErrCode,
            ErrMsg = result.ErrMsg,
            IsOrg = result.IsOrg
        };
    }

    private async Task<Result> PushResultSettleAllSites(SettleCriteria criteria)
    {
        var tasks = appSettingsKey.Value.SiteDbServer
            .Select(server => PushResultSettleOneSite(criteria, server))
            .ToList();

        var results = await Task.WhenAll(tasks);

        return results[0];
    }

    private async Task<Result> PushResultSettleOneSite(SettleCriteria criteria, string server)
    {
        criteria.DbServer = server;
        await repository.ExecuteAsync(criteria);
        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg,
            IsOrg = criteria.IsOrg
        };
    }

    private async Task<bool> HandleResultAmendment(SettleCriteria settleCriteria, List<ResourceItem> selectedResources)
    {

        if (SportGroup.SupportResultAmend.Contains(settleCriteria.SportType)
            && !settleCriteria.IsChildMatch
            && settleCriteria.Action != ActionType.UnCalculate)
        {
            return await dependencies.ResultAmendmentService.HandleResultAmendment(settleCriteria, selectedResources);
        }

        return false;
    }

    private async Task<Result> Execute(SettleCriteria criteria, List<ResourceItem> selectedResources)
    {
        var result = await ValidateBeforeExecute(criteria);
        if (result.IsSuccessful)
        {
            return await UpdateInfoAndSettle(criteria, selectedResources);
        }

        return result;
    }

    private async Task<Result> ValidateBeforeExecute(SettleCriteria criteria)
    {
        var request = new EventTicketRequest
        {
            MatchId = criteria.MatchId,
            Action = criteria.Action,
            SpName = criteria.SpName,
            Mode = ActionKey.ActionDictionary[criteria.Action],
            SelectedResources = criteria.SelectedResources
        };
        var resultMessage = await dependencies.ScaleOutSettleService.ValidateEventAndTicket(request);
        return new Result
        {
            ErrCode = resultMessage.ErrorCode,
            ErrMsg = resultMessage.ErrorMessage
        };
    }

    private async Task UpdateMatchInfo(SettleCriteria criteria)
    {
        var requestUpdateInfo = new UpdateMatchInfoRequest
        {
            Action = criteria.Action,
            AdminId = criteria.AdminId,
            MatchId = criteria.MatchId,
            SelectedResources = criteria.SelectedResources,
            BetStatus = criteria.BetStatus,
            DeterminedType = criteria.DeterminedType
        };

        await dependencies.ScaleOutSettleService.UpdateMatchInfo(requestUpdateInfo);
    }

    private async Task<string> GetChildMatchIds(int matchId, string actionName, string selectedResources)
    {
        var criteria = new GetChildMatchCriteria
        {
            MatchIds = matchId.ToString(),
            Mode = actionName
        };

        if (!string.IsNullOrWhiteSpace(selectedResources))
        {
            criteria.SelectedResources = selectedResources;
        }

        var listMatch = await repository.FetchAsync<ChildMatch>(criteria);
        var matchIds = listMatch.Select(item => item.MatchId).ToList();

        return matchIds.Count > 0 ? string.Join(',', matchIds.ToList()) : string.Empty;
    }

    public async Task<Result> SettleChildMatch(SettleChildMatchRequest request)
    {
        var criteria = dependencies.CreateQueryService.QuerySettleChildMatch(request);
        if (request.ChildMatches?.Count > 0)
        {
            foreach (var match in request.ChildMatches)
            {
                criteria.MatchId = match.MatchId;
                criteria.SelectedResources = dependencies.CreateQueryService.CreateResourceChildMatch(match);
                var result = await Execute(criteria, request.SelectedResources);
                dependencies.CreateQueryService.WriteLogChildMatch(criteria, result);
            }
        }
        else
        {
            var listChildMatch = request.ChildMatchIds.Split(',').ToList();

            criteria.SelectedResources = dependencies.CreateQueryService.CreateResources(request.SelectedResources);

            foreach (var match in listChildMatch)
            {
                criteria.MatchId = int.Parse(match);
                await Execute(criteria, request.SelectedResources);
            }
        }

        return new Result();
    }
}

public class MultipleServerAioServiceDependencies
{
    public ScaleOutSettleService ScaleOutSettleService { get; }
    public ICreateQueryService CreateQueryService { get; }
    public MergeDataService MergeDataService { get; }
    public LogService LogService { get; }
    public IMapper Mapper { get; }
    public ResultAmendmentService ResultAmendmentService { get; }

    public MultipleServerAioServiceDependencies(
        ScaleOutSettleService scaleOutSettleService,
        ICreateQueryService createQueryService,
        MergeDataService mergeDataService,
        LogService logService,
        IMapper mapper,
        ResultAmendmentService resultAmendmentService)
    {
        ScaleOutSettleService = scaleOutSettleService;
        CreateQueryService = createQueryService;
        MergeDataService = mergeDataService;
        LogService = logService;
        Mapper = mapper;
        ResultAmendmentService = resultAmendmentService;
    }
}