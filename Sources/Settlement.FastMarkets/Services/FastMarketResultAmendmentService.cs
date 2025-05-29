
using Fanex.Settlement.MessageBridge.Constants;
using Fanex.Settlement.MessageBridge.ResultAmendment;
using MassTransit;
using Settlement.Core.Criteria;
using Settlement.FastMarkets.Criteria;
using ResourceItem = Fanex.Settlement.MessageBridge.ResultAmendment.ResourceItem;

public interface IFastMarketResultAmendmentService
{
    Task<IEnumerable<ResultChanged>> GetResultChanged(PushFastMarketResultCriteria request, string selectedResources);

    Task PublishResultAmendment(PushFastMarketResultCriteria request, IEnumerable<ResourceItem> selectedResources, IEnumerable<ResultChanged> results);
}


public class FastMarketResultAmendmentService(
    IDynamicRepository repository,
     IPublishEndpoint publishEndpoint) : IFastMarketResultAmendmentService
{
    public async Task<IEnumerable<ResultChanged>> GetResultChanged(PushFastMarketResultCriteria request, string selectedResources)
    {

        var criteria = new CheckReSettleCriteria
        {
            MatchId = request.MatchId,
            Action = request.Action,
            SelectedResources = selectedResources
        };
        return await repository.FetchAsync<ResultChanged>(criteria);
    }

    public async Task PublishResultAmendment(PushFastMarketResultCriteria request, IEnumerable<ResourceItem> selectedResources, IEnumerable<ResultChanged> results)
    {
        await publishEndpoint.Publish(new ResultAmended(
            request.MatchId,
            request.BroadcastSessionId,
            1,
            request.Action,
            selectedResources.ToList(),
            results.ToList(),
            ResultAmendmentType.FastMarket
        ),
        new CancellationTokenSource(TimeSpan.FromSeconds(3)).Token);
    }
}
