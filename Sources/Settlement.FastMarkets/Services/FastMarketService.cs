using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Models;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;

namespace Settlement.FastMarkets.Services
{
    public interface IFastMarketService
    {
        Task<FastMarketModel> Query(int matchId);

        Task<Result> Calculate(SettleRequest request);

        Task<List<FastMarketResult>> GetLastestResult(GetLastestResultRequest request);

        Task<List<TimeMachineResult>> GetTimeMachineResult(GetTimeMachineResultRequest request);
    }

    public class FastMarketServiceImp : IFastMarketService
    {
        private readonly IDynamicRepository repository;

        private readonly IFastMarketResultService fastMarketResultService;

        private readonly IFastMarketBetTypeService fastMarketBetTypeService;

        private readonly IEventCounterService eventCounterService;

        private readonly IMapper mapper;

        private readonly INapSession currentSession;

        private readonly IHttpContextAccessor accessor;

        public FastMarketServiceImp(
            IDynamicRepository repository,
            IFastMarketResultService fastMarketResultService,
            IFastMarketBetTypeService fastMarketBetTypeService,
            IEventCounterService eventCounterService,
            IMapper mapper,
            INapSession currentSession,
            IHttpContextAccessor accessor)
        {
            this.repository = repository;
            this.fastMarketResultService = fastMarketResultService;
            this.fastMarketBetTypeService = fastMarketBetTypeService;
            this.eventCounterService = eventCounterService;
            this.mapper = mapper;
            this.currentSession = currentSession;
            this.accessor = accessor;
        }

        public async Task<FastMarketModel> Query(int matchId)
        {
            var criteria = new GetFastMarketMatchDetailCriteria { MatchId = matchId };

            var mappingTypes = new[] { typeof(EventCounter), typeof(string), typeof(FastMarketResult), typeof(TicketCounts), typeof(ResultDetail) };
            var fetchedData = await repository.FetchMultipleAsync(criteria, mappingTypes);
            var eventCounter = fetchedData[0].Cast<EventCounter>().ToList();
            var handicapValue = fetchedData[1].Cast<string>().FirstOrDefault();
            var fastMarketResult = fetchedData[2].Cast<FastMarketResult>().ToList();
            var ticketsCount = fetchedData[3].Cast<TicketCounts>().FirstOrDefault();
            var resultDetail = fetchedData[4].Cast<ResultDetail>().ToList();
            var groupFastMarketByBetType = fastMarketBetTypeService.BetTypesList(fastMarketResult, handicapValue);

            return new FastMarketModel
            {
                MatchId = matchId,
                EventCounters = eventCounter,
                HandicapValue = handicapValue,
                BetTypes = groupFastMarketByBetType,
                TicketCount = ticketsCount,
                ResultDetail = resultDetail
            };
        }

        public async Task<Result> Calculate(SettleRequest request)
        {
            var eventCounter = eventCounterService.Result(request);
            var results = fastMarketResultService.Result(request.BetTypes, request.Action);

            var criteria = mapper.Map<SettleRequest, PushFastMarketResultCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            criteria.EventCounters = eventCounter;
            criteria.Results = results;

            await repository.ExecuteAsync(criteria);

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }

        public async Task<List<FastMarketResult>> GetLastestResult(GetLastestResultRequest request)
        {
            var criteria = mapper.Map<GetLastestResultRequest, GetLastestResultCriteria>(request);
            var result = await repository.FetchAsync<FastMarketResult>(criteria);

            return result.ToList();
        }

        public async Task<List<TimeMachineResult>> GetTimeMachineResult(GetTimeMachineResultRequest request)
        {
            var criteria = mapper.Map<GetTimeMachineResultRequest, GetTimeMachineResultCriteria>(request);
            var result = await repository.FetchAsync<TimeMachineResult>(criteria);

            return result.ToList();
        }
    }
}