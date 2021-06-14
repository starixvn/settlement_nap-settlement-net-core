using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.Criterias;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using Settlement.Sportsbook.Core.Criterias;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Services
{
    public interface IAioService
    {
        Task<AioMatch> GetMatch(GetMatchRequest request);

        Task<Result> Settle(SettleRequest request);

        Task<List<Models.ResultDetail>> GetRecalResult(GetRecalResultRequest request);

        Task<MarkedTickets> CheckMarkedTickets(CheckMarkedTicketsRequest request);

        Task<Result> RefundParlay(RefundParlayRequest request);

        Task<Result> VerifyNoRunningOdds(CheckRunningOddsRequest request);

        Task<Result> SaveScore(SaveScoreRequest request);

        Task<MarkedTickets> CheckMarkedTicketsParlay(CheckMarkedTicketsParlayRequest request);

        Task<Result> RefundParlayChildMatch(RefundParlayChildMatchRequest request);

        Task<Result> SettleChildMatch(SettleChildMatchRequest request);
    }

    public class AioService : IAioService
    {
        private readonly IDynamicRepository repository;

        private readonly IMapper mapper;

        private readonly PermissionService permissionService;

        private readonly IRefDataService refDataService;

        private readonly ICreateQueryService createQueryService;

        private readonly IMapperFactory mapperFactory;

        private readonly IValidateApiKeyService validateApiKeyService;

        private readonly IConfiguration configuration;

        public AioService(
            IDynamicRepository repository,
            PermissionService permissionService,
            IRefDataService refDataService,
            IMapper mapper,
            IMapperFactory mapperFactory,
            IValidateApiKeyService validateApiKeyService,
            ICreateQueryService createQueryService,
            IConfiguration configuration)
        {
            this.repository = repository;
            this.permissionService = permissionService;
            this.refDataService = refDataService;
            this.mapper = mapper;
            this.mapperFactory = mapperFactory;
            this.validateApiKeyService = validateApiKeyService;
            this.createQueryService = createQueryService;
            this.configuration = configuration;
        }

        public async Task<AioMatch> GetMatch(GetMatchRequest request)
        {
            var apiKey = validateApiKeyService.GetApiKey(request.ApiKey);
            var matchCriteria = validateApiKeyService.CriteriaName(request, $"{apiKey}-{ ApiKeyConstant.MatchInfoKey}");
            var matchDetail = await repository.GetAsync<Models.MatchDetail>(matchCriteria);
            var externalResults = new List<ExternalResultModel>();
            if (matchDetail != null)
            {
                matchDetail.RefDataService = refDataService;
                var providerMapperService = mapperFactory.GetMapperService($"{apiKey}-{ApiKeyConstant.ProviderKey}");
                if (providerMapperService != null)
                {
                    var providerCriteria = validateApiKeyService.CriteriaName(request, $"{apiKey}-{ApiKeyConstant.ProviderKey}");
                    var providerResult = await repository.FetchAsync<ExternalResultDetailModel>(providerCriteria);
                    var provider = new Tuple<List<ExternalResultDetailModel>, List<ExternalResultModel>>(providerResult.ToList(), new List<ExternalResultModel>());
                    providerMapperService.Decorate(provider);
                    externalResults = provider.Item2;
                }
            }

            var resultDetailCriteria = validateApiKeyService.CriteriaName(request, $"{apiKey}-{ApiKeyConstant.ResultDetailKey}");
            var (firstResultSet, secondResultSet) = await repository.FetchMultipleAsync<Models.ResultDetail, TicketCounts>(resultDetailCriteria);
            var resultDetails = firstResultSet.ToList();

            var mapperService = mapperFactory.GetMapperService($"{apiKey}-{ApiKeyConstant.ResultDetailKey}");
            if (mapperService != null)
            {
                mapperService.Decorate(resultDetails);
            }

            var ticketCounts = secondResultSet.FirstOrDefault() ?? new TicketCounts();
            var hedgeMatchCriteria = validateApiKeyService.CriteriaName(request, $"{apiKey}-{ApiKeyConstant.HedgeMatchInfoKey}");
            var hedgeMatchDetail = await repository.GetAsync<HedgeMatchDetail>(hedgeMatchCriteria);

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

        public async Task<List<Models.ResultDetail>> GetRecalResult(GetRecalResultRequest request)
        {
            var criteria = mapper.Map<GetRecalResultRequest, GetRecalResultCriteria>(request);
            var resultDetails = await repository.FetchAsync<Models.ResultDetail>(criteria);

            return resultDetails.ToList();
        }

        public async Task<MarkedTickets> CheckMarkedTickets(CheckMarkedTicketsRequest request)
        {
            var criteria = new CheckMarkedTicketsCriteria
            {
                MatchId = request.MatchId,
                ResourceIds = GetResourceIds(request.SelectedResources)
            };
            await repository.ExecuteAsync(criteria);

            return new MarkedTickets
            {
                IsExistMarkedTicket = criteria.IsExistMarkedTicket
            };
        }

        public async Task<Result> Settle(SettleRequest request)
        {
            var criteria = createQueryService.QuerySettle(request);
            await repository.ExecuteAsync(criteria);

            var settleResult = new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg,
                ChildMatchIds = request.SportType == SportType.Cricket && criteria.ErrCode == 0 ? await GetChildMatchIds(request.MatchId, criteria.Action, criteria.SelectedResources) : string.Empty,
                ServiceCommand = criteria.ServiceCommand
            };

            return settleResult;
        }

        public async Task<Result> RefundParlay(RefundParlayRequest request)
        {
            var criteria = createQueryService.QueryRefundParlay(request);
            await repository.ExecuteAsync(criteria);

            var result = new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg,
                ChildMatchIds = request.SportType == SportType.Cricket && criteria.ErrCode == 0 ? await GetChildMatchIds(request.MatchId, SettleType.CalculateMixParlay) : string.Empty
            };

            return result;
        }

        public async Task<Result> VerifyNoRunningOdds(CheckRunningOddsRequest request)
        {
            if (configuration.GetSection("EnableVerifyingRunningOdds").Value == "0")
            {
                return new Result();
            }
            var criteria = new VerificationCriteria
            {
                MatchId = request.MatchId,
                SelectedResource = request.SelectedResources,
                Action = request.Action
            };

            await repository.ExecuteAsync(criteria);

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }

        public async Task<Result> SaveScore(SaveScoreRequest request)
        {
            var requestQuery = createQueryService.QuerySaveScore(request);
            var criteria = validateApiKeyService.CreateNonQueryCommand(requestQuery, $"{requestQuery.ApiKey}-{ ApiKeyConstant.SaveScore}") as IReturnValue;
            await repository.ExecuteAsync((INonQueryCommand)criteria);
            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }

        private async Task<string> GetChildMatchIds(int matchId, string actionName, string selectedResources = "")
        {
            var criteria = new GetChildMatchCriteria();
            criteria.matchIds = matchId.ToString();
            criteria.mode = actionName;
            if (selectedResources != "")
            {
                criteria.SelectedResources = selectedResources;
            }
            var listMatch = await repository.FetchAsync<ChildMatch>(criteria);
            var matchIds = listMatch.Select(item => item.matchId).ToList();

            return matchIds.Count > 0 ? string.Join(',', matchIds.ToList()) : string.Empty;
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

        public async Task<Result> RefundParlayChildMatch(RefundParlayChildMatchRequest request)
        {
            var listChildMatch = request.MatchIds.Split(',').ToList();
            var criteria = createQueryService.QueryRefundParlayChildMatch(request);

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

            var criteria = createQueryService.QuerySettleChilMatch(request);

            foreach (var match in listChildMatch)
            {
                criteria.MatchId = int.Parse(match);
                await repository.ExecuteAsync(criteria);
            }

            return new Result();
        }
    }
}