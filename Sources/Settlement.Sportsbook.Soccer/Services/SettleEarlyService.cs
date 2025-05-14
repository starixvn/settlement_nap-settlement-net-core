using Fanex.Settlement.MessageBridge.RefundEvents;
using MassTransit;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services;

public interface SettleEarlyService
{
    public Task<Result> CalculateEarly(SettleEarlyRequest request);
}

public class SettleEarlyServiceImp(
    ICreateCriteriaService createCriteriaService,
    IOptions<AppSettingsKey> appSettingsKey,
    IDynamicRepository repository,
    ScaleOutSettleService scaleOutSettleService,
    LogService logService,
    IPublishEndpoint publishEndpoint)
    : SettleEarlyService
{
    public async Task<Result> CalculateEarly(SettleEarlyRequest request)
    {
        var criteria = createCriteriaService.CreateCalculateEarlyCriteria(request);
        var requestChecking = await ValidateBeforeExecute(criteria);
        if (requestChecking.ErrCode > 0)
        {
            return requestChecking;
        }

        await WriteDirectlyLog(request);

        await UpdateMatchInfo(criteria);

        var result = await Execute(criteria);

        await PublishResultEvent(request);

        return result;
    }

    private async Task PublishResultEvent(SettleEarlyRequest request)
    {
        var selectedResources = request.SelectedResources
            .Select(resource => new Fanex.Settlement.MessageBridge.RefundEvents.ResourceItem
            {
                ResourceId = resource.ResourceId,
                HomeValue = resource.HomeValue,
                AwayValue = resource.AwayValue,
                OtherInfo = resource.OtherInfo,
                Determined = resource.Determined,
                IsSettleDetermined = resource.IsSettleDetermined,
                AwayId = resource.AwayId,
                HomeId = resource.HomeId,
                ResourceName = resource.ResourceName,
                GroupBetType = resource.GroupBetType
            }).ToList();

        if (request.ActionName.Equals(ActionName.RefundAll, StringComparison.OrdinalIgnoreCase))
        {
            await publishEndpoint.Publish(
                new ResultsRefunded(request.MatchId, request.SportType, request.ChildMatchType, selectedResources),
                new CancellationTokenSource(TimeSpan.FromSeconds(2)).Token);
        }

        if (request.ActionName.Equals(ActionName.CalculateAll, StringComparison.OrdinalIgnoreCase))
        {
            await publishEndpoint.Publish(
                new ResultsCalculated(request.MatchId, request.SportType, request.ChildMatchType, selectedResources),
                new CancellationTokenSource(TimeSpan.FromSeconds(2)).Token);
        }
    }

    private async Task WriteDirectlyLog(SettleEarlyRequest request)
    {
        var insertLogCriteria = createCriteriaService.CreateCalculateEarlyLogCriteria(request);
        await logService.WriteLog(insertLogCriteria);

        var message = $"NAP: Auto-Settlement ({request.ActionName}) for matchId: {request.MatchId} Result: {insertLogCriteria.SelectedResources}";
        await logService.WriteLog(request.MatchId, message);
    }

    private async Task<Result> Execute(CalculateEarlyCriteria criteria)
    {
        foreach (var server in appSettingsKey.Value.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
        }

        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg
        };
    }

    private async Task<Result> ValidateBeforeExecute(CalculateEarlyCriteria criteria)
    {
        var request = new EventTicketRequest
        {
            MatchId = criteria.MatchId,
            Action = criteria.Action,
            SpName = criteria.SpName,
            Mode = Mode.Early,
            SelectedResources = criteria.SelectedResources
        };
        var resultMessage = await scaleOutSettleService.ValidateEventAndTicket(request);
        return new Result
        {
            ErrCode = resultMessage.ErrorCode,
            ErrMsg = resultMessage.ErrorMessage
        };
    }

    private async Task UpdateMatchInfo(CalculateEarlyCriteria criteria)
    {
        var requestUpdateInfo = new UpdateMatchInfoRequest
        {
            Action = criteria.Action,
            AdminId = criteria.AdminId,
            MatchId = criteria.MatchId,
            SelectedResources = criteria.SelectedResources
        };

        await scaleOutSettleService.UpdateMatchInfo(requestUpdateInfo);
    }
}