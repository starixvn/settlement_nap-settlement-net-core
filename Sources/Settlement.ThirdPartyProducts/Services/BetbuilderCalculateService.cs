using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.Settlement.ScaleOut.Constants;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Constants;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;

namespace Settlement.ThirdPartyProducts.Services
{
    public interface BetBuilderCalculateService
    {
        Task UpdateMatchInfo(CalculationCriteria criteria, string selectedMarket);

        string CreateResources(List<ResourcesItemModel> selectedResources);

        CalculationCriteria CreateCriteria(int matchId, string actionName, string resources);

        Task<string> GetInfoMarket(CalculationCriteria criteria);
    }

    public class BetBuilderCalculateServiceImp : BetBuilderCalculateService
    {
        private readonly IDynamicRepository repository;

        private readonly XmlConvertService xmlConvertService;

        private readonly INapSession currentSession;

        private readonly IHttpContextAccessor accessor;

        private readonly ScaleOutSettleService scaleOutSettleService;

        public BetBuilderCalculateServiceImp(IDynamicRepository repository,
            XmlConvertService xmlConvertService,
            INapSession currentSession,
            IHttpContextAccessor accessor,
            ScaleOutSettleService scaleOutSettleService)
        {
            this.repository = repository;
            this.xmlConvertService = xmlConvertService;
            this.currentSession = currentSession;
            this.accessor = accessor;
            this.scaleOutSettleService = scaleOutSettleService;
        }

        public async Task UpdateMatchInfo(CalculationCriteria criteria, string selectedMarket)
        {
            var requestUpdate = new UpdateMatchInfoRequest
            {
                MatchId = criteria.MatchId,
                SelectedMarket = selectedMarket,
                SelectedSelection = criteria.SelectedSelection,
                IsAuto = false,
                Action = criteria.Action,
                Mode = Mode.BetBuilder
            };

            await scaleOutSettleService.UpdateMatchInfo(requestUpdate);
        }

        public string CreateResources(List<ResourcesItemModel> selectedResources)
        {
            var resources = new Resources<ResourcesItemModel>
            {
                ResourceItems = selectedResources
            };

            return xmlConvertService.Serialize(resources);
        }

        public CalculationCriteria CreateCriteria(int matchId, string actionName, string resources) => new CalculationCriteria
        {
            MatchId = matchId,
            AdminId = currentSession.UserId,
            Action = actionName,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            SelectedSelection = resources,
        };

        public async Task<string> GetInfoMarket(CalculationCriteria criteria)
        {
            var getMarketIdCriteria = new GetMarketIdCriteria
            {
                MatchId = criteria.MatchId,
                Action = criteria.Action,
                SelectedSelection = criteria.SelectedSelection,
                ResultStatusId = criteria.Action == ActionType.UnCalculate ? ResultStatus.Running : ResultStatus.ManuallySettled
            };

            var listMarketIds = (await repository.FetchAsync<string>(getMarketIdCriteria)).ToList();
            var resources = new ResourcesMarketIdModel
            {
                Items = listMarketIds.Select(item => new ResourceMarketItemModel { MarketId = item }).ToList()
            };

            return xmlConvertService.Serialize(resources);
        }
    }
}