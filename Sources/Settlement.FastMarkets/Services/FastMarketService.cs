using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.FastMarkets.Constants;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

        private readonly MultipleServerFetcherService multipleServerFetcherService;

        private readonly IConfiguration configuration;

        private readonly string fastMarketMode = "FM";

        public FastMarketServiceImp(
            IDynamicRepository repository,
            IFastMarketResultService fastMarketResultService,
            IFastMarketBetTypeService fastMarketBetTypeService,
            IEventCounterService eventCounterService,
            IMapper mapper,
            INapSession currentSession,
            IHttpContextAccessor accessor,
            MultipleServerFetcherService multipleServerFetcherService,
            IConfiguration configuration)
        {
            this.repository = repository;
            this.fastMarketResultService = fastMarketResultService;
            this.fastMarketBetTypeService = fastMarketBetTypeService;
            this.eventCounterService = eventCounterService;
            this.mapper = mapper;
            this.currentSession = currentSession;
            this.accessor = accessor;
            this.multipleServerFetcherService = multipleServerFetcherService;
            this.configuration = configuration;
        }

        public async Task<FastMarketModel> Query(int matchId)
        {
            var criteria = new GetFastMarketMatchDetailCriteria { MatchId = matchId };

            var mappingTypes = new[] { typeof(EventCounter), typeof(string), typeof(ResultDetail), typeof(FastMarketResult) };
            var fetchedData = await repository.FetchMultipleAsync(criteria, mappingTypes);
            var eventCounter = fetchedData[0].Cast<EventCounter>().ToList();
            var handicapValue = fetchedData[1].Cast<string>().FirstOrDefault();
            var resultDetail = fetchedData[2].Cast<ResultDetail>().ToList();
            var fastMarketResult = fetchedData[3].Cast<FastMarketResult>().ToList();

            var (fastMarketTicketDetails, ticketsCount) = await multipleServerFetcherService.GetFastMarketTicketDetail(matchId);
            MergeFastMarketTicketsToResults(fastMarketResult, fastMarketTicketDetails);
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

        public void MergeFastMarketTicketsToResults(List<FastMarketResult> fastMarketResults, List<FastMarketResult> fastMarketTicketDetails)
        {
            var newTicketDetails = fastMarketTicketDetails.Where(ticketDetail => !fastMarketResults.Any(result => result.Equals(ticketDetail)));
            if (newTicketDetails.Any())
            {
                fastMarketResults.AddRange(newTicketDetails);
            }

            GenerateTicketsStatus(fastMarketResults, fastMarketTicketDetails);
        }

        private void GenerateTicketsStatus(List<FastMarketResult> fastMarketResults, List<FastMarketResult> fastMarketTicketDetails)
        {
            foreach (var result in fastMarketResults)
            {
                var ticketDetail = fastMarketTicketDetails.FirstOrDefault(detail => detail.BetType == result.BetType && detail.Position == result.Position);
                result.TicketStatus = CreateTicketStatus(ticketDetail);
            }
        }

        private int CreateTicketStatus(FastMarketResult ticketDetail)
        {
            if (ticketDetail == null || ticketDetail.TicketCount == 0)
            {
                return TicketStatus.NoTicket;
            }

            if (ticketDetail.TicketRunning > 0)
            {
                return TicketStatus.Running;
            }

            if (ticketDetail.TicketMarked > 0)
            {
                return TicketStatus.Marked;
            }

            return TicketStatus.Calculated;
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

            //var validationResult = await ValidateBeforePushing(criteria);
            //if (validationResult.ErrCode > 0)
            //{
            //    return validationResult;
            //}
            ExecuteCalculate(criteria);

            return new Result();
        }

        //private async Task<Result> ValidateBeforePushing(PushFastMarketResultCriteria criteria)
        //{
        //    var validateEvent = await ValidateEvent(criteria);

        //    if (validateEvent.ErrCode > 0)
        //    {
        //        return validateEvent;
        //    }

        //    var validateTicket = await ValidateTickets(criteria);

        //    if (validateTicket.ErrCode > 0)
        //    {
        //        return validateTicket;
        //    }

        //    return new Result();
        //}

        //private async Task<Result> ValidateTickets(PushFastMarketResultCriteria criteria)
        //{
        //    var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();
        //    var checkingCriteria = mapper.Map<PushFastMarketResultCriteria, ValidateBeforePushCriteria>(criteria);
        //    checkingCriteria.Mode = fastMarketMode;
        //    foreach (var server in servers)
        //    {
        //        checkingCriteria.DbServer = server;
        //        await repository.ExecuteAsync(checkingCriteria);
        //        if (checkingCriteria.ErrCode > 0)
        //        {
        //            return new Result
        //            {
        //                ErrCode = checkingCriteria.ErrCode,
        //                ErrMsg = checkingCriteria.ErrMsg
        //            };
        //        }
        //    }

        //    return new Result();
        //}

        //private async Task<Result> ValidateEvent(PushFastMarketResultCriteria criteria)
        //{
        //    var checkingCriteria = mapper.Map<PushFastMarketResultCriteria, ValidateEventCriteria>(criteria);
        //    checkingCriteria.Mode = fastMarketMode;
        //    await repository.ExecuteAsync(checkingCriteria);

        //    if (checkingCriteria.ErrCode > 0)
        //    {
        //        return new Result
        //        {
        //            ErrCode = checkingCriteria.ErrCode,
        //            ErrMsg = checkingCriteria.ErrMsg
        //        };
        //    }

        //    return new Result();
        //}

        private void ExecuteCalculate(PushFastMarketResultCriteria criteria)
        {
            var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();

            foreach (var server in servers)
            {
                criteria.DbServer = server;
                repository.Execute(criteria);
            }
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