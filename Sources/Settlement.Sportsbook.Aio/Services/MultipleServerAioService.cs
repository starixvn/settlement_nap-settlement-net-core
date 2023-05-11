using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Criteria.Cricket;
using Settlement.Sportsbook.Aio.Requests;
using Settlement.Sportsbook.Aio.Services.Cricket;

namespace Settlement.Sportsbook.Aio.Services;

public interface MultipleServerAioService
{
    public Task<(List<Models.ResultDetail>, TicketCounts)> FetchResultDetails(GetResultDetailCriteria criteria, int sportType);

    public Task<MarkedTickets> CheckMarkedTickets(CheckMarkedTicketsRequest request);

    public Task<Result> Settle(SettleRequest request);

    public Task<Result> SettleChildMatch(SettleChildMatchRequest request);
}

public class MultipleServerAioServiceImp : MultipleServerAioService
{
    private readonly IDynamicRepository repository;
    private readonly AppSettingsKey appSettingsKey;
    private readonly ScaleOutSettleService scaleOutSettleService;
    private readonly ICreateQueryService createQueryService;
    private readonly MergeDataService mergeDataService;
    private readonly NetPositionService netPositionService;
    private readonly LogDirectlyService logDirectlyService;

    public MultipleServerAioServiceImp(IDynamicRepository repository,
        IOptions<AppSettingsKey> appSettingsKey,
        ScaleOutSettleService scaleOutSettleService,
        ICreateQueryService createQueryService,
        MergeDataService mergeDataService,
        NetPositionService netPositionService, LogDirectlyService logDirectlyService)
    {
        this.repository = repository;
        this.appSettingsKey = appSettingsKey.Value;
        this.scaleOutSettleService = scaleOutSettleService;
        this.createQueryService = createQueryService;
        this.mergeDataService = mergeDataService;
        this.netPositionService = netPositionService;
        this.logDirectlyService = logDirectlyService;
    }

    public async Task<(List<Models.ResultDetail>, TicketCounts)> FetchResultDetails(GetResultDetailCriteria criteria, int sportType)
    {
        criteria.SportType = sportType;
        var fetchedResultDetails = await repository.FetchAsync<Models.ResultDetail>(criteria);
        var (ticketDetails, ticketCount) = await GetEarlyTicketDetails(criteria);
        var resultDetails = fetchedResultDetails.ToList();
        MergeTicketsToResults(resultDetails, ticketDetails, sportType, criteria.SettleType);

        return (resultDetails.Where(result => result.TicketStatus != TicketStatus.NotIncluded).ToList(), ticketCount);
    }

    private static void MergeTicketsToResults(List<Models.ResultDetail> resultDetails, List<Models.ResultDetail> ticketDetails, int sportType, string settleType)
    {
        var newTicketDetails = ticketDetails.Where(ticketDetail => !resultDetails.Any(result => result.Equals(ticketDetail)));

        resultDetails.AddRange(newTicketDetails);

        GenerateTicketsStatus(resultDetails, ticketDetails, sportType, settleType);
    }

    private static void GenerateTicketsStatus(List<Models.ResultDetail> results, List<Models.ResultDetail> ticketDetails, int sportType, string settleType)
    {
        foreach (var result in results)
        {
            var ticketDetail = ticketDetails.FirstOrDefault(detail => detail.ResourceId == result.ResourceId);
            result.TicketStatus = CreateTicketStatus(ticketDetail, sportType, settleType);
        }
    }

    private static string CreateTicketStatus(Models.ResultDetail ticketDetail, int sportType, string settleType)
    {
        if (ticketDetail == null)
        {
            return sportType == SportType.ESports ? TicketStatus.NoTicket : TicketStatus.NotIncluded;
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

        foreach (var server in appSettingsKey.SiteDbServer)
        {
            var ticketDetails = await GetTicketDetailsByServer(criteria, server);
            multipleTicketDetails.Add(ticketDetails);
        }

        return mergeDataService.MergeTicketDetails(multipleTicketDetails);
    }

    private async Task<(List<Models.ResultDetail>, TicketCounts)> GetTicketDetailsByServer(GetTicketDetailsCriteria criteria, string server)
    {
        criteria.DbServer = server;
        var (ticketDetails, ticketCounts) = await repository.FetchMultipleAsync<Models.ResultDetail, TicketCounts>(criteria);

        return (ticketDetails.ToList(), ticketCounts.FirstOrDefault() ?? new TicketCounts());
    }

    public async Task<MarkedTickets> CheckMarkedTickets(CheckMarkedTicketsRequest request)
    {
        var criteria = new CheckMarkedTicketsCriteria
        {
            MatchId = request.MatchId,
            ResourceIds = GetResourceIds(request.SelectedResources)
        };

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

    private static string GetResourceIds(List<ResourceItem> betTypes)
    {
        var listResourceId = new List<string>();
        foreach (var betType in betTypes)
        {
            listResourceId.Add(betType.ResourceId);
        }

        return string.Join(",", listResourceId);
    }

    public async Task<Result> Settle(SettleRequest request)
    {
        var criteria = createQueryService.QuerySettle(request);
        var (result, resultCommands) = await Execute(criteria, request.SelectedResources);

        if (request.SportType == SportType.Cricket && result.IsSuccessful)
        {
            return await SettleChildMatchAndNetPosition(criteria, resultCommands);
        }

        return result;
    }

    private async Task<Result> SettleChildMatchAndNetPosition(SettleCriteria criteria, List<ResultCommand> resultCommands)
    {
        var updateStatusCriteria = new UpdateStatusServiceCriteria
        {
            MatchId = criteria.MatchId,
            Action = criteria.Action
        };

        var childMatchIds = await GetChildMatchIds(criteria.MatchId, criteria.Action, criteria.SelectedResources);

        var result = criteria.Action switch
        {
            SettleType.Calculate or SettleType.Refund => await netPositionService.Calculate(updateStatusCriteria,
                resultCommands, criteria.IsHedgeMatch),
            SettleType.Undo => await netPositionService.UnCalculate(updateStatusCriteria, resultCommands),
            _ => new Result()
        };

        result.ChildMatchIds = childMatchIds;

        return result;
    }

    private async Task SetUnderSettleFlag(SettleCriteria criteria, List<ResourceItem> selectedResources)
    {
        var actionToSetFlag = new List<string> { SettleType.Calculate, SettleType.Undo, SettleType.Refund };
        if (actionToSetFlag.Contains(criteria.Action) && selectedResources.Any(resource => resource.ResourceId == ResourceType.Final))
        {
            await scaleOutSettleService.UpdateUnderSettlementFlag(criteria.MatchId, criteria.AdminId, criteria.Action);
        }
    }

    private async Task<List<ResultCommand>> UpdateInfoAndSettle(SettleCriteria criteria, List<ResourceItem> selectedResources)
    {
        await SetUnderSettleFlag(criteria, selectedResources);

        await UpdateMatchInfo(criteria);

        var commandList = new List<ResultCommand>();

        //TODO
        logDirectlyService.WriteLog(criteria.MatchId, LogDirectlyServiceImp
            .CreateProfileLog(new ProfileLog(criteria.MatchId, criteria.Action, criteria.SelectedResources, criteria.BetStatus)));

        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
            var serviceCommand = criteria.ServiceCommand;
            commandList = await SetResultCommand(commandList, serviceCommand, server);
        }

        return commandList;
    }

    private async Task<(Result, List<ResultCommand>)> Execute(SettleCriteria criteria, List<ResourceItem> selectedResources)
    {
        var result = await ValidateBeforeExecute(criteria);
        var commandList = new List<ResultCommand>();
        if (result.IsSuccessful)
        {
            commandList = await UpdateInfoAndSettle(criteria, selectedResources);
        }

        return (result, commandList);
    }

    private async Task<List<ResultCommand>> SetResultCommand(List<ResultCommand> commandList, string serviceCommand, string server)
    {
        if (!string.IsNullOrWhiteSpace(serviceCommand))
        {
            var siteDbGroupId = await scaleOutSettleService.GetSiteGroupId(server);
            commandList.Add(new ResultCommand
            {
                DbServer = server,
                SiteDbGroupId = siteDbGroupId,
                ServiceCommand = serviceCommand
            });
        }

        return commandList;
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
        var resultMessage = await scaleOutSettleService.ValidateEventAndTicket(request);
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
            BetStatus = criteria.BetStatus
        };

        await scaleOutSettleService.UpdateMatchInfo(requestUpdateInfo);
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
        var criteria = createQueryService.QuerySettleChildMatch(request);
        if (request.ChildMatches?.Count > 0)
        {
            foreach (var match in request.ChildMatches)
            {
                criteria.MatchId = match.MatchId;
                criteria.SelectedResources = createQueryService.CreateResourceChildMatch(match);
                var (result, _) = await Execute(criteria, request.SelectedResources);
                createQueryService.WriteLogChildMatch(criteria, result);
            }
        }
        else
        {
            var listChildMatch = request.ChildMatchIds.Split(',').ToList();

            criteria.SelectedResources = createQueryService.CreateResources(request.SelectedResources);

            foreach (var match in listChildMatch)
            {
                criteria.MatchId = int.Parse(match);
                await Execute(criteria, request.SelectedResources);
            }
        }

        return new Result();
    }
}