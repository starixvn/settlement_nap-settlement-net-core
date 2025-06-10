using Fanex.Data.Repository;
using Fanex.Settlement.MessageBridge.ResultAmendment;
using MassTransit;
using Settlement.Core.Criteria.ResultAmendment;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;

using ResourceItem = Fanex.Settlement.MessageBridge.ResultAmendment.ResourceItem;

namespace Settlement.ThirdPartyProducts.Services
{
    public interface IBetbuilderResultAmendmentService
    {
        Task<IEnumerable<ResultChanged>> GetResultChanged(CalculateRequest request, string selectedResources);
        Task PublishResultAmendment(CalculateRequest request, IEnumerable<ResourceItem> selectedResources, IEnumerable<ResultChanged> results);
    }

    public class BetbuilderResultAmendmentService : IBetbuilderResultAmendmentService
    {
        private readonly IDynamicRepository _repository;
        private readonly IPublishEndpoint _publishEndpoint;

        public BetbuilderResultAmendmentService(IDynamicRepository repository, IPublishEndpoint publishEndpoint)
        {
            _repository = repository;
            _publishEndpoint = publishEndpoint;
        }

        public async Task<IEnumerable<ResultChanged>> GetResultChanged(CalculateRequest request, string selectedResources)
        {
            var criteria = new CheckReSettleCriteria
            {
                MatchId = request.MatchId,
                Action = request.ActionName,
                SelectedResources = selectedResources
            };

            var result = await _repository.FetchAsync<ResultChanged>(criteria);

            return result;
        }

        public async Task PublishResultAmendment(CalculateRequest request, IEnumerable<ResourceItem> selectedResources, IEnumerable<ResultChanged> results)
        {
            var selectionTypes = string.Join(',', selectedResources
                .Select(x => x.ResourceId)
                .Concat(results.Select(r => r.ResourceId))
                .Distinct());

            var selectionMarkets = await GetMarkets(request.MatchId, selectionTypes);

            var newSelectedResources = selectedResources.Join(
                selectionMarkets,
                resource => resource.ResourceId,
                market => market.SelectionType,
                (resource, market) =>
                {
                    resource.OtherInfo = market.MarketId;
                    return resource;
                }).ToList();

            var newResultChanged = results.Join(
                selectionMarkets,
                changed => changed.ResourceId,
                market => market.SelectionType,
                (changed, market) =>
                {
                    changed.OtherInfo = market.MarketId;
                    return changed;
                }).ToList();

            await _publishEndpoint.Publish(new ResultAmended(
                request.MatchId,
                request.BroadcastSessionId,
                request.SportType,
                request.ActionName,
                [.. newSelectedResources],
                [.. newResultChanged],
                "BB"
            ),
            new CancellationTokenSource(TimeSpan.FromSeconds(3)).Token);
        }

        private async Task<List<SelectionMarket>> GetMarkets(int matchId, string selectionTypes)
        {
            var ciriteria = new GetSelectionMarketsCriteria
            {
                MatchId = matchId,
                SelectionTypes = selectionTypes
            };
            var markets = await _repository.FetchAsync<SelectionMarket>(ciriteria);

            return [.. markets];
        }
    }
}
