using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Requests;
using System.Threading.Tasks;
using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Constants;
using System.Collections.Generic;
using System.Linq;
using System;

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

        private readonly XmlConvertService xmlConvertService;

        private readonly IResourceService resourceService;

        private readonly IBetStatusAllService betStatusAllService;

        public RefundServiceImp(
            IDynamicRepository repository,
            INapSession currentSession,
            IMapper mapper,
            IHttpContextAccessor accessor,
            XmlConvertService xmlConvertService,
            IResourceService resourceService,
            IBetStatusAllService betStatusAllService)
        {
            this.repository = repository;
            this.currentSession = currentSession;
            this.mapper = mapper;
            this.accessor = accessor;
            this.xmlConvertService = xmlConvertService;
            this.resourceService = resourceService;
            this.betStatusAllService = betStatusAllService;
        }

        public async Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsRequest request)
        {
            var criteria = mapper.Map<CheckingMarkedTicketsRequest, CheckingMarkedTicketsCriteria>(request);
            await repository.ExecuteAsync(criteria);

            return new MarkedTickets { IsExistMarkedTicket = criteria.IsExistMarkedTicket };
        }

        public async Task<Result> Refund(RefundRequest request)
        {
            var criteria = new RefundCriteria
            {
                MatchId = request.MatchId,
                Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
                AdminId = currentSession.UserId,
                GoalSequence = request.GoalRecord,
                HalfTimeHome = request.HalfTimeHomeScore ?? 0,
                HalfTimeAway = request.HalfTimeAwayScore ?? 0,
                FullTimeAway = request.FinalAwayScore ?? 0,
                FullTimeHome = request.FinalHomeScore ?? 0,
                Action = request.ActionName,
                SDTRecord = SettleDetermineTicket(request),
                BetStatus = GetBetStatus(request),
                ResourceResult = GetResourceResult(request)
            };

            if (IsAbandonedMatch(request) && request.ActionName.Equals(ActionType.RefundAll))
            {
                criteria.FullTimeAway = request.HalfTimeAwayScore ?? 0;
                criteria.FullTimeHome = request.HalfTimeHomeScore ?? 0;
            }

            await repository.ExecuteAsync(criteria);

            var result = new Result
            {
                ErrMsg = criteria.ErrMsg,
                ErrCode = criteria.ErrCode
            };

            return await RefundHedgeMatch(result, request, criteria);
        }

        private async Task<Result> RefundHedgeMatch(Result result, RefundRequest request, RefundCriteria criteria)
        {
            if (result.IsSuccessful && request.IsApplyHedging)
            {
                if (!request.ActionName.Equals(ActionType.RefundHalfTime) && !request.IsDeterminedHedgeMatch)
                {
                    request.IsSettleAbandonedMatchIbc = false;
                    criteria.SDTRecord = SettleDetermineTicket(request);
                    criteria.ResourceResult = string.Empty;
                }

                criteria.MatchId = request.HedgeMatchId;
                await repository.ExecuteAsync(criteria);
            }

            return result;
        }

        private string GetBetStatus(RefundRequest request)
        {
            if (request.ActionName.Equals(ActionType.RefundHalfTime))
            {
                return string.Empty;
            }

            return IsAbandonedMatch(request) ? betStatusAllService.GetBetStatusRefund(request) : request.BetStatus;
        }

        private string GetResourceResult(RefundRequest request)
        {
            var goalCondition = mapper.Map<RefundRequest, GoalCondition>(request);
            List<XmlResource> resources;
            var actionName = request.ActionName;

            if (IsAbandonedMatch(request) && actionName.Equals(ActionType.RefundFullTime))
            {
                resources = resourceService.FullTimeResourcesSettleDetermined(goalCondition);
            }
            else if (IsAbandonedMatch(request) && actionName.Equals(ActionType.RefundAll))
            {
                resources = resourceService.AllResourcesSettleDetermined(goalCondition);
            }
            else
            {
                resources = actionName switch
                {
                    ActionType.RefundHalfTime => resourceService.HalftimeResources(goalCondition, SettlementStatus.RefundHT),
                    ActionType.RefundFullTime => resourceService.FullTimeResources(goalCondition, SettlementStatus.RefundFT),
                    _ => resourceService.AllResources(goalCondition, SettlementStatus.Refund),
                };
            }

            return resources.Count > 0
                ? xmlConvertService.Serialize(new XmlResults { Resources = resources })
                : string.Empty;
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

        private static bool IsAbandonedMatch(RefundRequest request)
        {
            return request.IsSettleAbandonedMatchIbc || request.IsSettleAbandonedMatchBetDaq || request.IsSettleAbandonedMatchBetFair;
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

            await repository.ExecuteAsync(criteria);

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }

        public async Task<Result> MoveThirdPartyBetTickets(MoveBetRequest request)
        {
            var criteria = mapper.Map<MoveBetRequest, MoveThirdPartyBetTicketCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();

            await repository.ExecuteAsync(criteria);

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }
    }
}