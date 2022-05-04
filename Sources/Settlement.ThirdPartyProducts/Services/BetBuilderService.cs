using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Core.Web.Session;
using Kaden.Extensions;
using Kaden.XmlConverter;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.Core.Models;
using Settlement.Core.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace Settlement.ThirdPartyProducts.Services
{
    public interface BetBuilderService
    {
        Task<NotificationStatusModel> GetNotificationStatus();

        Task<List<Sport>> GetSports(SportRequest request);

        Task<List<LeagueTypeModel>> GetLeagues(LeaguesRequest request);

        Task<List<SelectionDetailModel>> GetSelection(int matchId);

        Task<Result> Calculate(CalculateRequest request);
    }

    public class BetBuilderServiceImp : BetBuilderService
    {
        private readonly IDynamicRepository repository;

        private readonly RefDataService refDataService;

        private readonly XmlConvertService xmlConvertService;

        private readonly ICurrentSession currentSession;

        public BetBuilderServiceImp(
            IDynamicRepository repository,
            RefDataService refDataService,
             XmlConvertService xmlConvertService,
            ICurrentSession currentSession)
        {
            this.repository = repository;
            this.refDataService = refDataService;
            this.xmlConvertService = xmlConvertService;
            this.currentSession = currentSession;
        }

        public async Task<NotificationStatusModel> GetNotificationStatus()
        {
            return new NotificationStatusModel
            {
                IsExistTicketRunningBetBuilder = await repository.GetAsync<bool>(new NotificationStatusCriteria(true)),
            };
        }

        public async Task<List<Sport>> GetSports(SportRequest request)
        {
            var criteria = Mapper.Map<SportRequest, SportCriteria>(request);
            var sports = (await repository.FetchAsync<Sport>(criteria)).ToList();
            sports.ForEach(item =>
            {
                item.SportName = refDataService.GetSportName(item.SportType);
            });
            return sports;
        }

        public async Task<List<LeagueTypeModel>> GetLeagues(LeaguesRequest request)
        {
            var criteria = Mapper.Map<LeaguesRequest, LeaguesCriteria>(request);
            var leagues = (await repository.FetchAsync<LeagueTypeModel>(criteria)).ToList();
            foreach (var item in leagues)
            {
                item.SportName = refDataService.GetSportName(item.SportType);
                item.LeagueName = refDataService.GetLeagueName(item.LeagueId);
                item.Group = string.Format("All {0} Leagues", item.SportName);
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
            var resources = new Resources<ResourcesItemModel>
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
            Ip = HttpContext.Current.ClientIP(),
            Resources = resources
        };
    }
}