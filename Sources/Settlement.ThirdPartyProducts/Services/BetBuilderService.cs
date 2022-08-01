using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Settlement.ThirdPartyProducts.Services
{
    public interface BetBuilderService
    {
        Task<List<Sport>> GetSports(SportRequest request);

        Task<List<LeagueTypeModel>> GetLeagues(LeaguesRequest request);

        Task<List<SelectionDetailModel>> GetSelection(int matchId);

        Task<Result> Calculate(CalculateRequest request);
    }

    public class BetBuilderServiceImp : BetBuilderService
    {
        private readonly IDynamicRepository repository;

        private readonly IRefDataService refDataService;

        private readonly XmlConvertService xmlConvertService;

        private readonly INapSession currentSession;

        private readonly IHttpContextAccessor accessor;

        private readonly IMapper mapper;

        public BetBuilderServiceImp(
            IDynamicRepository repository,
            IRefDataService refDataService,
            XmlConvertService xmlConvertService,
            INapSession currentSession,
            IHttpContextAccessor accessor,
            IMapper mapper)
        {
            this.repository = repository;
            this.refDataService = refDataService;
            this.xmlConvertService = xmlConvertService;
            this.currentSession = currentSession;
            this.accessor = accessor;
            this.mapper = mapper;
        }

        public async Task<List<Sport>> GetSports(SportRequest request)
        {
            var criteria = mapper.Map<SportRequest, SportCriteria>(request);
            var sports = (await repository.FetchAsync<Sport>(criteria)).ToList();
            sports.ForEach(item =>
            {
                item.SportName = refDataService.GetSportName(item.SportType);
            });
            return sports;
        }

        public async Task<List<LeagueTypeModel>> GetLeagues(LeaguesRequest request)
        {
            var criteria = mapper.Map<LeaguesRequest, LeaguesCriteria>(request);
            var leagues = (await repository.FetchAsync<LeagueTypeModel>(criteria)).ToList();
            foreach (var item in leagues)
            {
                item.SportName = refDataService.GetSportName(item.SportType);
                item.LeagueName = refDataService.GetLeagueName(item.LeagueId);
                item.Group = $"All {item.SportName} Leagues";
            }

            return leagues.OrderBy(item => item.SportType).ThenBy(item => item.LeagueName).ToList();
        }

        public async Task<List<SelectionDetailModel>> GetSelection(int matchId)
        {
            var criteria = new SelectionDetailCriteria { MatchId = matchId };
            return (await repository.FetchAsync<SelectionDetailModel>(criteria)).ToList();
        }

        public async Task<Result> Calculate(CalculateRequest request)
        {
            var resourcesResult = CreateResources(request.Resources);

            var criteria = CreateCriteria(request.MatchId, request.ActionName, resourcesResult);

            await repository.ExecuteAsync(criteria);

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }

        private string CreateResources(List<ResourcesItemModel> selectedResources)
        {
            var resources = new Models.Resources<ResourcesItemModel>
            {
                ResourceItems = selectedResources
            };

            return xmlConvertService.Serialize(resources);
        }

        private CalculationCriteria CreateCriteria(int matchId, string actionName, string resources) => new CalculationCriteria
        {
            MatchId = matchId,
            AdminId = currentSession.UserId,
            Action = actionName,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            Resources = resources
        };
    }
}