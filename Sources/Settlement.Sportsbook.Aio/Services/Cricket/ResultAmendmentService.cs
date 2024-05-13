using Fanex.Logging;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Constants.Cricket;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Criteria.Cricket;
using Settlement.Sportsbook.Aio.Models;
using System.Text.Json;

namespace Settlement.Sportsbook.Aio.Services.Cricket;

public interface ResultAmendmentService
{
    Task<bool> HandleResultAmendment(SettleCriteria settleCriteria, List<ResourceItem> selectedResources);

    Task UpdateResultHistory(ResultHistoryUpdateCriteria criteria);
}

public class ResultAmendmentServiceImp(
    IDynamicRepository repository,
    IOptions<AppSettingsKey> appSettingsKey,
    GenerateResultAmendmentService generateResultAmendmentService)
    : ResultAmendmentService
{
    public async Task<bool> HandleResultAmendment(SettleCriteria settleCriteria, List<ResourceItem> selectedResources)
    {
        try
        {
            return await ProcessResultAmendment(settleCriteria, selectedResources);
        }
        catch (Exception ex)
        {
            await LogService.ErrorAsync("ResultAmendmentService", ex);
            return false;
        }
    }

    public async Task UpdateResultHistory(ResultHistoryUpdateCriteria criteria)
    {
        foreach (var server in appSettingsKey.Value.SiteDbServer.Where(x => x != "DBTXN"))
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
        }
    }

    private async Task<bool> ProcessResultAmendment(SettleCriteria settleCriteria, List<ResourceItem> selectedResources)
    {
        var criteria = new CheckReSettleCriteria
        {
            MatchId = settleCriteria.MatchId,
            SelectedResources = settleCriteria.SelectedResources,
            Action = settleCriteria.Action
        };

        var resultsChanged = await CheckReSettleTicket(criteria, settleCriteria.Action);

        if (resultsChanged.Count == 0)
        {
            return false;
        }

        var resultHistoryItems = resultsChanged.Select((item, index)
            => CreateResultHistoryItem(item.ToList(), selectedResources, item.Key, index + 1));

        var resultHistoryInsCriteria = CreateResultHistoryInsCriteria(settleCriteria, resultHistoryItems.ToList());

        InsResultHistory(resultHistoryInsCriteria);

        return true;
    }

    private async Task<List<IGrouping<short, ResultChanged>>> CheckReSettleTicket(CheckReSettleCriteria criteria, string currentAction)
    {
        var results = await repository.FetchAsync<ResultChanged>(criteria);

        var resultsSetActionType = results.Select(x =>
        {
            x.ReSettleType = GetReSettleActionType(x.Action, currentAction);
            return x;
        });

        var resultsChangedGroupBy = resultsSetActionType
            .Where(x => x.ReSettleType != ReSettleType.UnKnow)
            .GroupBy(x => x.ReSettleType).ToList();

        return resultsChangedGroupBy;
    }

    private void InsResultHistory(ResultHistoryInsCriteria resultHistoryInsCriteria)
    {
        foreach (var server in appSettingsKey.Value.SiteDbServer.Where(x => x != "DBTXN"))
        {
            resultHistoryInsCriteria.DbServer = server;
            repository.Execute(resultHistoryInsCriteria);
        }
    }

    private static ResultHistoryInsCriteria CreateResultHistoryInsCriteria(SettleCriteria settleCriteria, List<ResultHistoryItem> resultHistoryItems)
    {
        var criteria = new ResultHistoryInsCriteria
        {
            MatchId = settleCriteria.MatchId,
            SessionID = settleCriteria.BroadcastSessionId,
            SportType = settleCriteria.SportType,
            ResourceInfo = CreateResourceInfo(resultHistoryItems)
        };

        return criteria;
    }

    private ResultHistoryItem CreateResultHistoryItem(List<ResultChanged> resultsChanged, List<ResourceItem> selectedResources, int actionType, int seqNo)
    {
        var (wrongResult, actualResult) = generateResultAmendmentService.CreateWrongActualResults(resultsChanged, selectedResources);

        var extraInfo = generateResultAmendmentService.CreateExtraInfo(resultsChanged);

        var resultHistoryItem = new ResultHistoryItem
        {
            SeqNo = seqNo,
            WrongResult = wrongResult,
            ActualResult = actualResult,
            ExtraInfo = extraInfo,
            ActionType = actionType,
        };

        return resultHistoryItem;
    }

    private static short GetReSettleActionType(string beforeAction, string currentAction)
        => (beforeAction.ToUpperInvariant(), currentAction.ToUpperInvariant()) switch
        {
            (var a, string c) when a.Contains(ActionType.RefundAll) && c.Contains(ActionType.CalculateAll) =>
                ReSettleType.RefundToCalc,

            (string a, string c) when a.Contains(ActionType.CalculateAll) && c.Contains(ActionType.RefundAll) =>
                ReSettleType.CalcToRefund,

            (string a, string c) when a.Contains(ActionType.CalculateAll) && c.Contains(ActionType.CalculateAll) =>
                ReSettleType.ReCalc,

            _ => ReSettleType.UnKnow,
        };

    private static string CreateResourceInfo(List<ResultHistoryItem> resultHistoryItems) => JsonSerializer.Serialize(resultHistoryItems);
}