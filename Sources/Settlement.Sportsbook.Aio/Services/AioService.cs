using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.Criterias;
using Settlement.Sportsbook.Aio.Mapper;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using Settlement.Sportsbook.Core.Criterias;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Services
{
    public interface IAioService
    {
        Task<AioMatch> GetMatch(GetMatchRequest request);

        Task<ResultAio> Settle(SettleRequest request);

        Task<List<MatchResultDetail>> GetRecalResult(GetRecalResultRequest request);

        Task<MarkedTickets> CheckMarkedTickets(CheckMarkedTicketsRequest request);

        Task<MarkedTickets> CheckMarkedTicketsParlay(CheckMarkedTicketsParlayRequest request);

        Task<ResultAio> RefundParlay(RefundParlayRequest request);

        Task<Result> RefundParlayChildMatch(RefundParlayChildMatchRequest request);

        Task<Result> SettleChildMatch(SettleChildMatchRequest request);
    }

    public class AioService : IAioService
    {
        private readonly IHttpContextAccessor accessor;

        private readonly IDynamicRepository repository;

        private readonly IMapper mapper;

        private readonly PermissionService permissionService;

        private readonly IRefDataService refDataService;

        private readonly XmlConvertService xmlConvertService;

        private readonly INapSession currentSession;

        private readonly IMapperFactory mapperFactory;

        private readonly IValidateApiKeyService validateApiKeyService;

        public AioService(
            IDynamicRepository repository,
            PermissionService permissionService,
            IRefDataService refDataService,
            XmlConvertService xmlConvertService,
            INapSession currentSession,
            IMapper mapper,
            IHttpContextAccessor accessor,
            IMapperFactory mapperFactory,
            IValidateApiKeyService validateApiKeyService)
        {
            this.repository = repository;
            this.permissionService = permissionService;
            this.refDataService = refDataService;
            this.xmlConvertService = xmlConvertService;
            this.currentSession = currentSession;
            this.mapper = mapper;
            this.accessor = accessor;
            this.mapperFactory = mapperFactory;
            this.validateApiKeyService = validateApiKeyService;
        }

        public async Task<AioMatch> GetMatch(GetMatchRequest request)
        {
            var getMatchDetailCriteria = mapper.Map<GetMatchRequest, GetMatchDetailCriteria>(request);
            var matchDetail = await repository.GetAsync<MatchDetail>(getMatchDetailCriteria);
            var externalResults = new List<ExternalResultModel>();
            if (matchDetail != null)
            {
                matchDetail.RefDataService = refDataService;
                var providerMapperService = mapperFactory.GetMapperService($"{request.SportType}-{ApiKeyConstant.ProviderKey}");
                if (providerMapperService != null)
                {
                    var providerCriteria = validateApiKeyService.CriteriaName(request, $"{request.SportType}-{ApiKeyConstant.ProviderKey}");
                    var providerResult = await repository.FetchAsync<ExternalResultDetailModel>(providerCriteria);
                    var provider = new Tuple<List<ExternalResultDetailModel>, List<ExternalResultModel>>(providerResult.ToList(), new List<ExternalResultModel>());
                    providerMapperService.Decorate(provider);
                    externalResults = provider.Item2;
                }
            }

            var getResultDetailCriteria = mapper.Map<GetMatchRequest, GetResultDetailCriteria>(request);
            var (firstResultSet, secondResultSet) = await repository.FetchMultipleAsync<MatchResultDetail, TicketCounts>(getResultDetailCriteria);
            var resultDetails = firstResultSet.ToList();

            var mapperService = mapperFactory.GetMapperService($"{request.SportType}-{ApiKeyConstant.ResultDetailKey}");
            if (mapperService != null)
            {
                mapperService.Decorate(resultDetails);
            }

            var ticketCounts = secondResultSet.FirstOrDefault() ?? new TicketCounts();
            var getHedgeMatchCriteria = mapper.Map<GetMatchRequest, GetHedgeMatchCriteria>(request);
            var hedgeMatchDetail = await repository.GetAsync<HedgeMatchDetail>(getHedgeMatchCriteria);

            return new AioMatch
            {
                MatchDetail = matchDetail,
                ResultDetails = resultDetails,
                TicketCounts = ticketCounts,
                Permission = permissionService.Permission,
                HedgeMatchDetail = hedgeMatchDetail,
                ExternalResults = externalResults
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

        public async Task<ResultAio> Settle(SettleRequest request)
        {
            var criteria = mapper.Map<SettleRequest, SettleCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            criteria.SelectedResources = CreateSettleResources(request.SelectedResources);
            await repository.ExecuteAsync(criteria);

            var settleResult = new ResultAio
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg,
                ServiceCommand = criteria.ServiceCommand,
                ChildMatchIds = string.Empty
            };

            var childMatchService = mapperFactory.GetFetchService($"{request.SportType}-{ApiKeyConstant.ChildMatchKey}");
            if (childMatchService != null)
            {
                await childMatchService.Fetch(settleResult, criteria.MatchId, criteria.SelectedResources );
            }


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

            criteria.mode = actionName;
        public async Task<MarkedTickets> CheckMarkedTicketsParlay(CheckMarkedTicketsParlayRequest request)
        {
            var criteria = mapper.Map<CheckMarkedTicketsParlayRequest, CheckMarkedTicketsParlayCriteria>(request);
            await repository.ExecuteAsync(criteria);

            return new MarkedTickets
            {
                IsExistMarkedTicket = criteria.IsExistMarkedTicket
            };
        }

        public async Task<ResultAio> RefundParlay(RefundParlayRequest request)
        {
            var criteria = mapper.Map<RefundParlayRequest, RefundParlayCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            await repository.ExecuteAsync(criteria);

            var result = new ResultAio
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg,
                ChildMatchIds = string.Empty
            };

            var childMatchService = mapperFactory.GetFetchService($"{request.SportType}-{ApiKeyConstant.ChildMatchKey}");
            if (childMatchService != null)
            {
                await childMatchService.Fetch(result, criteria.MatchId, "");
            }

            return result;
        }

        public async Task<Result> RefundParlayChildMatch(RefundParlayChildMatchRequest request)
        {
            var listChildMatch = request.MatchIds.Split(',').ToList();
            var criteria = mapper.Map<RefundParlayChildMatchRequest, RefundParlayCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();

            foreach (var match in listChildMatch)
            {
                criteria.MatchId = int.Parse(match);
                await repository.ExecuteAsync(criteria);
            }

            return new Result();
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

        public async Task<Result> SettleChildMatch(SettleChildMatchRequest request)
        {
            var listChildMatch = request.ChildMatchIds.Split(',').ToList();
            var criteria = mapper.Map<SettleChildMatchRequest, SettleCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            criteria.SelectedResources = CreateSettleResources(request.SelectedResources);

            foreach (var match in listChildMatch)
            {
                criteria.MatchId = int.Parse(match);
                await repository.ExecuteAsync(criteria);
            }

            return new Result();
        }
    }
}