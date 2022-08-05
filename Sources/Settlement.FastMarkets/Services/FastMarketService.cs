using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.Settlement.ScaleOut.Services;
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
using Microsoft.Extensions.Options;
using Fanex.Settlement.ScaleOut.Request;
using Settlement.FastMarkets.Models.TimeMachineOldResult;

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

        private readonly IFastMarketBetTypeService fastMarketBetTypeService;

        private readonly IMapper mapper;

        private readonly MultipleServerFetcherService multipleServerFetcherService;

        private readonly AppSettingsKey appSettingsKey;

        private readonly CreateQueryService createQueryService;

        private readonly ScaleOutSettleService scaleOutSettleService;

        private readonly string fastMarketMode = "FM";

        public FastMarketServiceImp(
            IDynamicRepository repository,
            IFastMarketBetTypeService fastMarketBetTypeService,
            IMapper mapper,
            MultipleServerFetcherService multipleServerFetcherService,
            IOptions<AppSettingsKey> appSettingsKey,
            ScaleOutSettleService scaleOutSettleService,
            CreateQueryService createQueryService)
        {
            this.repository = repository;
            this.fastMarketBetTypeService = fastMarketBetTypeService;
            this.mapper = mapper;
            this.multipleServerFetcherService = multipleServerFetcherService;
            this.appSettingsKey = appSettingsKey.Value;
            this.scaleOutSettleService = scaleOutSettleService;
            this.createQueryService = createQueryService;
        }

        public async Task<FastMarketModel> Query(int matchId)
        {
            var criteria = new GetFastMarketMatchDetailCriteria { MatchId = matchId };

            var mappingTypes = new[] { typeof(EventCounter), typeof(string), typeof(FastMarketResult), typeof(ResultDetail) };
            var fetchedData = await repository.FetchMultipleAsync(criteria, mappingTypes);
            var eventCounter = fetchedData[0].Cast<EventCounter>().ToList();
            var handicapValue = fetchedData[1].Cast<string>().FirstOrDefault();
            var fastMarketResult = fetchedData[2].Cast<FastMarketResult>().ToList();
            var resultDetail = fetchedData[3].Cast<ResultDetail>().ToList();

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
            var criteria = await createQueryService.QuerySettle(request);

            var validationRequest = new EventTicketRequest
            {
                MatchId = criteria.MatchId,
                Action = criteria.Action,
                SpName = criteria.SpName,
                Mode = fastMarketMode
            }; 

            var validationResult = await scaleOutSettleService.ValidateEventAndTicket(validationRequest);
            if (validationResult.ErrorCode > 0)
            {
                return new Result
                {
                    ErrCode = validationResult.ErrorCode,
                    ErrMsg = validationResult.ErrorMessage
                };
            }
            var requestUpdateInfo = new UpdateMatchInfoRequest
            {
                MatchId = criteria.MatchId,
                Action = criteria.Action,
                AdminId = criteria.AdminId,
                ResourceResult = criteria.Results,
                Mode = fastMarketMode
            };

            await scaleOutSettleService.UpdateMatchInfo(requestUpdateInfo);

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
            foreach (var server in appSettingsKey.SiteDbServer)
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