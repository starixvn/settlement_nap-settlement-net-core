using AutoMapper;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Requests;
using System;
using System.Threading.Tasks;

namespace Settlement.FastMarkets.Services
{
    public interface CreateQueryService
    {
        Task<PushFastMarketResultCriteria> QuerySettle(SettleRequest request);
    }

    public class CreateQueryServiceImp : CreateQueryService
    {
        private readonly IFastMarketResultService fastMarketResultService;
        private readonly IEventCounterService eventCounterService;
        private readonly IMapper mapper;
        private readonly INapSession currentSession;
        private readonly IHttpContextAccessor accessor;

        public CreateQueryServiceImp(IFastMarketResultService fastMarketResultService,
            IEventCounterService eventCounterService,
            IMapper mapper,
            INapSession currentSession,
            IHttpContextAccessor accessor)
        {
            this.fastMarketResultService = fastMarketResultService;
            this.eventCounterService = eventCounterService;
            this.mapper = mapper;
            this.currentSession = currentSession;
            this.accessor = accessor;
        }
        public async Task<PushFastMarketResultCriteria> QuerySettle(SettleRequest request)
        {
            var eventCounter = eventCounterService.Result(request);
            var results = fastMarketResultService.Result(request.BetTypes, request.Action);

            var criteria = mapper.Map<SettleRequest, PushFastMarketResultCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            criteria.EventCounters = eventCounter;
            criteria.Results = results;
            criteria.OldResults = await fastMarketResultService.OldResults(request.BetTypes, request.MatchId);
            criteria.BroadcastSessionId = Guid.NewGuid().ToString();

            return criteria;
        }
    }
}
