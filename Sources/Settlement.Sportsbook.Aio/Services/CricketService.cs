using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using Settlement.Sportsbook.Aio.Criterias;
using System.Threading.Tasks;
using Settlement.Core.Models;
using System.Linq;
using Settlement.Core.Services;
using Fanex.NAP.Client.Helpers.Web;
using System.Collections.Generic;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;

namespace Settlement.Sportsbook.Aio.Services
{
    public interface ICricketService
    {
        Task<Match> GetMatch(GetMatchRequest request);

        Task<Result> Settle(SettleRequest request);

        Task<List<MatchResultDetail>> GetRecalResult(GetRecalResultRequest request);

        Task<MarkedTickets> CheckMarkedTickets(CheckMarkedTicketsRequest request);

        Task<MarkedTickets> CheckMarkedTicketsParlay(CheckMarkedTicketsParlayRequest request);

        Task<Result> RefundParlay(RefundParlayRequest request);
    }

    public class CricketService : ICricketService
    {
        private readonly IHttpContextAccessor accessor;

        private readonly IDynamicRepository repository;

        private readonly IMapper mapper;

        private readonly PermissionService permissionService;

        private readonly IRefDataService refDataService;

        private readonly XmlConvertService xmlConvertService;

        private readonly INapSession currentSession;

        private readonly ICricketBetTypeService cricketBetTypeService;

        public CricketService(
            IDynamicRepository repository,
            PermissionService permissionService,
            IRefDataService refDataService,
            XmlConvertService xmlConvertService,
            INapSession currentSession,
            ICricketBetTypeService cricketBetTypeService,
            IMapper mapper,
            IHttpContextAccessor accessor)
        {
            this.repository = repository;
            this.permissionService = permissionService;
            this.refDataService = refDataService;
            this.xmlConvertService = xmlConvertService;
            this.currentSession = currentSession;
            this.cricketBetTypeService = cricketBetTypeService;
            this.mapper = mapper;
            this.accessor = accessor;
        }

        public async Task<Match> GetMatch(GetMatchRequest request)
        {
            var getMatchDetailCriteria = mapper.Map<GetMatchRequest, GetMatchDetailCriteria>(request);
            var matchDetail = await repository.GetAsync<MatchDetail>(getMatchDetailCriteria);
            if (matchDetail != null)
            {
                matchDetail.RefDataService = refDataService;
            }

            var getResultDetailCriteria = mapper.Map<GetMatchRequest, GetResultDetailCriteria>(request);
            var (firstResultSet, secondResultSet) = await repository.FetchMultipleAsync<MatchResultDetail, TicketCounts>(getResultDetailCriteria);
            var resultDetails = firstResultSet.ToList();
            cricketBetTypeService.GroupBetTypesAndGenerateNames(resultDetails);
            var ticketCounts = secondResultSet.FirstOrDefault() ?? new TicketCounts();
            var getHedgeMatchCriteria = mapper.Map<GetMatchRequest, GetHedgeMatchCriteria>(request);
            var hedgeMatchDetail = await repository.GetAsync<HedgeMatchDetail>(getHedgeMatchCriteria);

            return new Match
            {
                MatchDetail = matchDetail,
                ResultDetails = resultDetails,
                TicketCounts = ticketCounts,
                Permission = permissionService.Permission,
                HedgeMatchDetail = hedgeMatchDetail
            };
        }

        public async Task<List<MatchResultDetail>> GetRecalResult(GetRecalResultRequest request)
        {
            var criteria = mapper.Map<GetRecalResultRequest, GetRecalResultCriteria>(request);
            var results = await repository.FetchAsync<MatchResultDetail>(criteria);

            return results.ToList();
        }

        public async Task<MarkedTickets> CheckMarkedTickets(CheckMarkedTicketsRequest request)
        {
            var criteria = mapper.Map<CheckMarkedTicketsRequest, CheckMarkedTicketsCriteria>(request);
            criteria.ResourceIds = GetResourceIds(request.SelectedResources);
            await repository.ExecuteAsync(criteria);

            return new MarkedTickets
            {
                IsExistMarkedTicket = criteria.IsExistMarkedTicket
            };
        }

        public async Task<Result> Settle(SettleRequest request)
        {
            var criteria = mapper.Map<SettleRequest, SettleCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            criteria.SelectedResources = CreateSettleResources(request.SelectedResources);
            await repository.ExecuteAsync(criteria);

            var settleResult = new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg,
                ServiceCommand = criteria.ServiceCommand
            };

            if (settleResult.IsSuccessful && request.IsApplyHedging)
            {
                criteria.MatchId = request.HedgeMatchId;
                await repository.ExecuteAsync(criteria);
            }

            return settleResult;
        }

        private string CreateSettleResources(List<ResourceItem> selectedResources)
        {
            var resources = new Resources<ResourceItem>
            {
                ResourceItems = selectedResources
            };

            return xmlConvertService.Serialize(resources);
        }

        public async Task<MarkedTickets> CheckMarkedTicketsParlay(CheckMarkedTicketsParlayRequest request)
        {
            var criteria = mapper.Map<CheckMarkedTicketsParlayRequest, CheckMarkedTicketsParlayCriteria>(request);
            await repository.ExecuteAsync(criteria);

            return new MarkedTickets
            {
                IsExistMarkedTicket = criteria.IsExistMarkedTicket
            };
        }

        public async Task<Result> RefundParlay(RefundParlayRequest request)
        {
            var criteria = mapper.Map<RefundParlayRequest, RefundParlayCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            await repository.ExecuteAsync(criteria);

            var result = new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };

            return result;
        }

        private static string GetResourceIds(List<ResourceItem> betTypes)
        {
            var listResourceId = new List<string>();
            foreach (var betType in betTypes)
            {
                listResourceId.Add(betType.ResourceId);
            }

            return string.Join(",", listResourceId);
        }
    }
}