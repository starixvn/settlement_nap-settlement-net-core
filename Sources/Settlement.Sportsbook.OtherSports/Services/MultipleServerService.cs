using Fanex.Data.Repository;
using Fanex.NAP.Client;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Sportsbook.OtherSports.Constants;
using Settlement.Sportsbook.OtherSports.Criteria;
using Settlement.Sportsbook.OtherSports.Requests;

namespace Settlement.Sportsbook.OtherSports.Services
{
    public interface MultipleServerService
    {
        Task<(MatchDetail, List<TicketCounts>)> GetMatchInfo(GetMatchRequest request);

        Task<Result> Refund(RefundCriteria refundCriteria);

        Task<Result> RefundParlay(ParlayCriteria criteria);

        Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsCriteria criteria);

        Task<Result> Calculate(CalculateCriteria calculateCriteria);
    }

    public class MultipleServerServiceImp : MultipleServerService
    {
        private readonly IDynamicRepository repository;
        private readonly AppSettingsKey appSettingsKey;
        private readonly MergeDataService mergeDataService;
        private readonly ScaleOutSettleService scaleOutSettleService;

        public MultipleServerServiceImp(
            IDynamicRepository repository,
            IOptions<AppSettingsKey> appSettingsKey,
            MergeDataService mergeDataService,
            ScaleOutSettleService scaleOutSettleService
            )
        {
            this.repository = repository;
            this.appSettingsKey = appSettingsKey.Value;
            this.mergeDataService = mergeDataService;
            this.scaleOutSettleService = scaleOutSettleService;
        }

        public async Task<(MatchDetail, List<TicketCounts>)> GetMatchInfo(GetMatchRequest request)
        {
            var criteria = new GetSportsbookMatchDetailCriteria
            {
                MatchId = request.MatchId,
                IsRefundPage = request.IsRefundPage
            };

            var mappingTypes = new[] { typeof(MatchDetail), typeof(object) };
            var fetchedResult = await repository.FetchMultipleAsync(criteria, mappingTypes);
            var matchDetail = fetchedResult[0].Cast<MatchDetail>().FirstOrDefault();
            Check.Argument.IsNotNull(matchDetail, $"Match ${criteria.MatchId} does not exist");
            var ticketInfoCriteria = new GetTicketInfoCriteria { MatchId = request.MatchId };
            var multipleTicketCounts = await GetTicketInfo(ticketInfoCriteria);
            var ticketCounts = mergeDataService.MergeTicketCounts(multipleTicketCounts);
            mergeDataService.MergeMatchDetail(matchDetail, ticketCounts);
            mergeDataService.GroupTicketCount(ticketCounts);

            return (matchDetail, ticketCounts);
        }

        private async Task<List<List<TicketCounts>>> GetTicketInfo(GetTicketInfoCriteria criteria)
        {
            var multipleTickets = new List<List<TicketCounts>>();
            foreach (var server in appSettingsKey.SiteDbServer)
            {
                criteria.DbServer = server;
                var mappingTypes = new[] { typeof(object), typeof(TicketCounts) };
                var ticketInfo = await repository.FetchMultipleAsync(criteria, mappingTypes);
                multipleTickets.Add(ticketInfo[1].Cast<TicketCounts>().ToList());
            }

            return multipleTickets;
        }

        public async Task<Result> Calculate(CalculateCriteria calculateCriteria)
        {
            var validateRequest = new EventTicketRequest
            {
                MatchId = calculateCriteria.MatchId,
                Action = calculateCriteria.Action,
                SpName = calculateCriteria.SpName,
                Mode = ActionKey.ActionDictionary[calculateCriteria.Action]
            };

            var requestChecking = await ValidateBeforeExecute(validateRequest);
            if (requestChecking.ErrCode > 0)
            {
                return requestChecking;
            }

            await SetUnderSettleFlag(calculateCriteria.MatchId, calculateCriteria.AdminId, calculateCriteria.Action);

            var requestUpdateInfo = new UpdateMatchInfoRequest
            {
                MatchId = calculateCriteria.MatchId,
                Action = calculateCriteria.Action,
                AdminId = calculateCriteria.AdminId,
                BetStatus = calculateCriteria.BetStatus,
                FullTimeAway = calculateCriteria.FullTimeAway,
                FullTimeHome = calculateCriteria.FullTimeHome,
                HalfTimeAway = calculateCriteria.HalfTimeAway,
                HalfTimeHome = calculateCriteria.HalfTimeHome
            };

            await IsHtTicketSettled(requestUpdateInfo);

            await scaleOutSettleService.UpdateMatchInfo(requestUpdateInfo);

            foreach (var server in appSettingsKey.SiteDbServer)
            {
                calculateCriteria.DbServer = server;
                repository.Execute(calculateCriteria);
            }

            return requestChecking;
        }

        public async Task<Result> Refund(RefundCriteria refundCriteria)
        {
            var validateRequest = new EventTicketRequest
            {
                MatchId = refundCriteria.MatchId,
                Action = refundCriteria.Action,
                SpName = refundCriteria.SpName,
                Mode = ActionKey.ActionDictionary[refundCriteria.Action]
            };

            var requestChecking = await ValidateBeforeExecute(validateRequest);
            if (requestChecking.ErrCode > 0)
            {
                return requestChecking;
            }

            await SetUnderSettleFlag(refundCriteria.MatchId, refundCriteria.AdminId, refundCriteria.Action);

            var requestUpdateInfo = new UpdateMatchInfoRequest
            {
                MatchId = refundCriteria.MatchId,
                Action = refundCriteria.Action,
                AdminId = refundCriteria.AdminId,
                BetStatus = refundCriteria.BetStatus
            };

            await IsHtTicketSettled(requestUpdateInfo);

            await scaleOutSettleService.UpdateMatchInfo(requestUpdateInfo);

            foreach (var server in appSettingsKey.SiteDbServer)
            {
                refundCriteria.DbServer = server;
                repository.Execute(refundCriteria);
            }

            return requestChecking;
        }

        private async Task IsHtTicketSettled(UpdateMatchInfoRequest request)
        {
            if (request.Action == ActionType.CalculateFullTime || request.Action == ActionType.RefundFullTime)
            {
                const int halfTimeGroupId = 1;
                var criteria = new GetTicketInfoCriteria
                {
                    MatchId = request.MatchId,
                    IsRefundPage = request.Action == ActionType.RefundFullTime
                };
                var multipleTicketCounts = await GetTicketInfo(criteria);
                var ticketCounts = mergeDataService.MergeTicketCounts(multipleTicketCounts);
                var ticketHt = ticketCounts.FirstOrDefault(item => item.GroupId == halfTimeGroupId);
                request.IsHtTicketSettled = ticketHt != null && ticketHt.BetRunningCount == 0;
            }
        }

        private async Task<Result> ValidateBeforeExecute(EventTicketRequest request)
        {
            var resultMessage = await scaleOutSettleService.ValidateEventAndTicket(request);
            return new Result
            {
                ErrCode = resultMessage.ErrorCode,
                ErrMsg = resultMessage.ErrorMessage
            };
        }

        private async Task SetUnderSettleFlag(int matchId, int adminId, string action)
        {
            var actionToSetFlag = new List<string> { ActionType.CalculateAll, ActionType.UnCalculate, ActionType.CalculateFullTime, ActionType.RefundFullTime, ActionType.RefundAll };
            if (actionToSetFlag.Contains(action))
            {
                await scaleOutSettleService.UpdateUnderSettlementFlag(matchId, adminId, action);
            }
        }

        public async Task<Result> RefundParlay(ParlayCriteria criteria)
        {
            var validateRequest = new EventTicketRequest
            {
                MatchId = criteria.MatchId,
                Action = criteria.Action,
                SpName = criteria.SpName,
                Mode = "MP"
            };

            var requestChecking = await ValidateBeforeExecute(validateRequest);
            if (requestChecking.ErrCode > 0)
            {
                return requestChecking;
            }

            var requestUpdateInfo = new UpdateMatchInfoRequest
            {
                MatchId = criteria.MatchId,
                Action = criteria.Action,
                AdminId = criteria.AdminId,
                Mode = "MP",
            };

            await scaleOutSettleService.UpdateMatchInfo(requestUpdateInfo);

            foreach (var server in appSettingsKey.SiteDbServer)
            {
                criteria.DbServer = server;
                repository.Execute(criteria);
            }

            return requestChecking;
        }

        public async Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsCriteria criteria)
        {
            foreach (var server in appSettingsKey.SiteDbServer)
            {
                criteria.DbServer = server;
                await repository.ExecuteAsync(criteria);
                if (criteria.IsExistMarkedTicket)
                {
                    return new MarkedTickets
                    {
                        IsExistMarkedTicket = criteria.IsExistMarkedTicket
                    };
                }
            }

            return new MarkedTickets();
        }
    }
}