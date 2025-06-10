using Fanex.Settlement.MessageBridge.ResultAmendment;
using MassTransit;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Criteria.ResultAmendment;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Criteria.Cricket;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Cricket;
using System.Text.Json;
using LogService = Fanex.Logging.LogService;
using ResourceItem = Settlement.Core.Models.ResourceItem;

namespace Settlement.Sportsbook.Aio.Services;

public interface ResultAmendmentService
{
    Task<bool> HandleResultAmendment(SettleCriteria settleCriteria, List<ResourceItem> selectedResources);

    Task UpdateResultHistory(ResultHistoryUpdateCriteria criteria);
}

public class ResultAmendmentServiceImp(
    IDynamicRepository repository,
    IOptions<AppSettingsKey> appSettingsKey,
    GenerateResultAmendmentService generateResultAmendmentService,
    IPublishEndpoint publishEndpoint)
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

        var results = await repository.FetchAsync<ResultChanged>(criteria);
        var resultsChanged = ResultAmendmentCoreService.CheckReSettleTicket(results, settleCriteria.Action);

        if (resultsChanged.Count == 0)
        {
            return false;
        }

        var hasPublish = await PublishResultAmendment(settleCriteria, selectedResources, results);

        if (hasPublish)
        {
            return true;
        }

        var resultHistoryItems = resultsChanged
            .Select((item, index) => CreateResultHistoryItem(item.ToList(), selectedResources, item.Key, index + 1));

        var resultHistoryInsCriteria = CreateResultHistoryInsCriteria(settleCriteria, [.. resultHistoryItems]);

        InsResultHistory(resultHistoryInsCriteria);

        return true;
    }

    private async Task<bool> PublishResultAmendment(SettleCriteria settleCriteria, List<ResourceItem> selectedResources, IEnumerable<ResultChanged> results)
    {
        var specialSportTypes = new List<int> { SportType.BasketBall, SportType.ESports, SportType.VolleyBall, SportType.TableTennis, SportType.Tennis };
        specialSportTypes.AddRange([SportType.Badminton, SportType.BeachVolleyball]);

        if (!specialSportTypes.Contains(settleCriteria.SportType))
        {
            return false;
        }

        await publishEndpoint.Publish(new ResultAmended(
                settleCriteria.MatchId,
                settleCriteria.BroadcastSessionId,
                settleCriteria.SportType,
                settleCriteria.Action,
                [.. selectedResources.Select(x => new Fanex.Settlement.MessageBridge.ResultAmendment.ResourceItem
                {
                    ResourceId = x.ResourceId,
                    HomeValue = x.HomeValue,
                    AwayValue = x.AwayValue,
                    AwayId = x.AwayId,
                    HomeId = x.HomeId,
                    OtherInfo = x.OtherInfo,
                    GroupBetType = x.GroupBetType,
                })],
                [.. results]),
                new CancellationTokenSource(TimeSpan.FromSeconds(3)).Token);

        return true;
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
            ActionType = actionType
        };

        return resultHistoryItem;
    }

    private static string CreateResourceInfo(List<ResultHistoryItem> resultHistoryItems) => JsonSerializer.Serialize(resultHistoryItems);
}