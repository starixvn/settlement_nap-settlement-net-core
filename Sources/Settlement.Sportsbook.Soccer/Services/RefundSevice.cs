using System;
using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Requests;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fanex.Settlement.ScaleOut.Services;
using Settlement.Core.Services;
using Fanex.Settlement.ScaleOut.Request;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface IRefundService
    {
        Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsRequest request);

        Task<Result> Refund(RefundRequest request);

        Task<Result> RefundRunningThirdPartyTickets(RefundRunningThirdPartyTicketRequest request);

        Task<Result> MoveThirdPartyBetTickets(MoveBetRequest request);
    }

    public class RefundServiceImp : IRefundService
    {
        private readonly IDynamicRepository repository;

        private readonly INapSession currentSession;

        private readonly IMapper mapper;

        private readonly IHttpContextAccessor accessor;

        private readonly IConfiguration configuration;

        private readonly ICreateCriteriaService createCriteriaService;

        private readonly ScaleOutSettleService scaleOutSettleService;

        public RefundServiceImp(
            IDynamicRepository repository,
            IMapper mapper,
            IHttpContextAccessor accessor,
            IConfiguration configuration,
            ICreateCriteriaService createCriteriaService,
            INapSession currentSession,
            ScaleOutSettleService scaleOutSettleService)
        {
            this.repository = repository;
            this.mapper = mapper;
            this.accessor = accessor;
            this.configuration = configuration;
            this.createCriteriaService = createCriteriaService;
            this.currentSession = currentSession;
            this.scaleOutSettleService = scaleOutSettleService;
        }

        public async Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsRequest request)
        {
            var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();
            var criteria = mapper.Map<CheckingMarkedTicketsRequest, CheckingMarkedTicketsCriteria>(request);
            foreach (var server in servers)
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

        public async Task<Result> Refund(RefundRequest request)
        {
            var criteria = createCriteriaService.CreateRefundCriteria(request);
            criteria.SDTRecord = SettleDetermineTicket(request);
            var validationResult = await ValidateBeforeExecute(criteria);
            if (validationResult.ErrCode > 0)
            {
                return validationResult;
            }

            await ExecuteRefund(criteria);
            await RefundHedgeMatch(request, criteria);

            return validationResult;
        }

        private async Task RefundHedgeMatch(RefundRequest request, RefundCriteria criteria)
        {
            if (request.IsApplyHedging)
            {
                if (!request.ActionName.Equals(ActionType.RefundHalfTime) && !request.IsDeterminedHedgeMatch)
                {
                    request.IsSettleAbandonedMatchIbc = false;
                    criteria.SDTRecord = SettleDetermineTicket(request);
                    criteria.ResourceResult = string.Empty;
                }

                criteria.MatchId = request.HedgeMatchId;
                await ExecuteRefund(criteria);
            }
        }

        private static byte SettleDetermineTicket(RefundRequest request)
        {
            var dictionary = new Dictionary<int, bool>
            {
                { 1, request.IsSettleAbandonedMatchBetDaq},
                { 2, request.IsSettleAbandonedMatchBetFair },
                { 4, request.IsSettleAbandonedMatchIbc },
                { 8, request.ExcludeTicketBetDaqInRefund },
                { 16, request.ExcludeTicketBetFairInRefund }
            };

            var value = dictionary.Where(item => item.Value).Sum(item => item.Key);

            return (byte)value;
        }

        private async Task<Result> ValidateBeforeExecute(RefundCriteria criteria)
        {
            var request = new EventTicketRequest
            {
                MatchId = criteria.MatchId,
                Action = criteria.Action,
                SpName = criteria.SpName,
                Mode = ActionKey.ActionDictionary[criteria.Action],
                SDTRecord = criteria.SDTRecord,
                ResourceResult = criteria.ResourceResult
            };
            var resultMessage = await scaleOutSettleService.ValidateEventAndTicket(request);
            return new Result
            {
                ErrCode = resultMessage.ErrorCode,
                ErrMsg = resultMessage.ErrorMessage
            };
        }

        private async Task UpdateMatchInfo(RefundCriteria criteria)
        {
            await scaleOutSettleService.UpdateUnderSettlementFlag(criteria.MatchId, criteria.AdminId, criteria.Action);
            var requestUpdateInfo = new UpdateMatchInfoRequest
            {
                MatchId = criteria.MatchId,
                Action = criteria.Action,
                AdminId = criteria.AdminId,
                BetStatus = criteria.BetStatus,
                FullTimeAway = criteria.FullTimeAway,
                FullTimeHome = criteria.FullTimeHome,
                HalfTimeAway = criteria.HalfTimeAway ?? 0,
                HalfTimeHome = criteria.HalfTimeHome ?? 0,
                ResourceResult = criteria.ResourceResult,
                SDTRecord = criteria.SDTRecord
            };

            await scaleOutSettleService.UpdateMatchInfo(requestUpdateInfo);
        }

        private async Task ExecuteRefund(RefundCriteria criteria)
        {
            await UpdateMatchInfo(criteria);
            var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();
            criteria.BroadcastSessionId = Guid.NewGuid().ToString();
            foreach (var server in servers)
            {
                criteria.DbServer = server;
                repository.Execute(criteria);
            }
        }

        public async Task<Result> RefundRunningThirdPartyTickets(RefundRunningThirdPartyTicketRequest request)
        {
            var criteria = new RefundRunningThirdPartyTicketCriteria
            {
                ActionName = request.ActionName,
                MatchId = request.MatchId,
                Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
                AdminId = currentSession.UserId,
            };

            var validationRequest = new EventTicketRequest
            {
                MatchId = criteria.MatchId,
                Action = request.ActionName,
                SpName = criteria.SpName,
                Mode = "REFUND"
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

            var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();
            foreach (var server in servers)
            {
                criteria.DbServer = server;
                repository.Execute(criteria);
            }

            return new Result();
        }

        public async Task<Result> MoveThirdPartyBetTickets(MoveBetRequest request)
        {
            var criteria = mapper.Map<MoveBetRequest, MoveThirdPartyBetTicketCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            var validationRequest = new EventTicketRequest
            {
                MatchId = criteria.MatchId,
                Action = "MoveTicket",
                SpName = criteria.SpName,
                Mode = request.ActionName
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

            var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();
            foreach (var server in servers)
            {
                criteria.DbServer = server;
                repository.Execute(criteria);
            }

            return new Result();
        }
    }
}