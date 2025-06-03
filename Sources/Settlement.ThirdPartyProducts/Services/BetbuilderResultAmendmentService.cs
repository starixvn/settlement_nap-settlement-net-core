using Fanex.Data.Repository;
using Fanex.Settlement.MessageBridge.ResultAmendment;
using MassTransit;
using Settlement.Core.Criteria;
using Settlement.ThirdPartyProducts.Requests;

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
            await _publishEndpoint.Publish(new ResultAmended(
                request.MatchId,
                request.BroadcastSessionId,
                1,
                request.ActionName,
                [.. selectedResources],
                [.. results],
                "BB"
            ),
            new CancellationTokenSource(TimeSpan.FromSeconds(3)).Token);
        }
    }
}
