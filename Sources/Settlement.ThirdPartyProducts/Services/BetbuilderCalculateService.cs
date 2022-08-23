using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Models;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Settlement.ThirdPartyProducts.Services
{
    public interface BetBuilderCalculateService
    {
        Task<(Result, string)> ValidateBeforeSettle(CalculationCriteria criteria);

        Task UpdateMatchInfo(CalculationCriteria criteria, string invalidMarketIds);

        string CreateResources(List<ResourcesItemModel> selectedResources);

        CalculationCriteria CreateCriteria(int matchId, string actionName, string resources);

        Task<string> GetInfoMarket(CalculationCriteria criteria);
    }

    public class BetBuilderCalculateServiceImp : BetBuilderCalculateService
    {
        private readonly IDynamicRepository repository;

        private readonly ScaleOutSettleThirdPartyService scaleOutSettleThirdPartyService;

        private readonly XmlConvertService xmlConvertService;

        private readonly INapSession currentSession;

        private readonly IHttpContextAccessor accessor;

        private readonly ScaleOutSettleService scaleOutSettleService;

        private const string BetBuilderMode = "BB";

        public BetBuilderCalculateServiceImp(IDynamicRepository repository,
            ScaleOutSettleThirdPartyService scaleOutSettleThirdPartyService,
            XmlConvertService xmlConvertService,
            INapSession currentSession,
            IHttpContextAccessor accessor,
            ScaleOutSettleService scaleOutSettleService)
        {
            this.repository = repository;
            this.scaleOutSettleThirdPartyService = scaleOutSettleThirdPartyService;
            this.xmlConvertService = xmlConvertService;
            this.currentSession = currentSession;
            this.accessor = accessor;
            this.scaleOutSettleService = scaleOutSettleService;
        }

        public async Task<(Result, string)> ValidateBeforeSettle(CalculationCriteria criteria)
        {
            var validateRequest = new BetBuilderRequest
            {
                MatchId = criteria.MatchId,
                Action = criteria.Action,
                SelectedResources = criteria.SelectedSelection,
                IsAuto = criteria.IsAuto,
            };
            var (resultValidate, invalidMarketIds) = await scaleOutSettleThirdPartyService.ValidateBetBuilder(validateRequest);
            var result = new Result
            {
                ErrCode = resultValidate.ErrorCode,
                ErrMsg = resultValidate.ErrorMessage
            };

            return (result, invalidMarketIds);
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
                Mode = BetBuilderMode
            };

            await scaleOutSettleService.UpdateMatchInfo(requestUpdate);
        }

        public string CreateResources(List<ResourcesItemModel> selectedResources)
        {
            var resources = new Models.Resources<ResourcesItemModel>
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
            var GetMarketIdCriteria = new GetMarketIdCriteria
            {
                MatchId = criteria.MatchId,
                Action = criteria.Action,
                SelectedSelection = criteria.SelectedSelection,
                ResultStatusId = criteria.Action == "UNDO" ? 3 : 5
            };

            var listMarketIds = (await repository.FetchAsync<string>(GetMarketIdCriteria)).ToList();
            var resources = new ResourcesMarketIdModel
            {
                Items = listMarketIds.Select(item => new ResourceMarketItemModel { MarketId = item }).ToList()
            };

            return xmlConvertService.Serialize(resources);
        }
    }
}