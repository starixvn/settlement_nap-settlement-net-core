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
using System;
using System.Collections.Generic;
using Kaden.Extensions;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface IRefundService
    {
        Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsRequest request);

        Task<Result> Refund(RefundRequest request);
    }

    public class RefundServiceImp : IRefundService
    {
        private const byte SettleAbandonedMatchIbcValue = 4;

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
                GoalSequence = string.IsNullOrWhiteSpace(request.GoalRecord)
                    ? string.Empty
                    : request.GoalRecord.ToLowerInvariant(),
                SDTRecord = SdtRecord(request),
                HalfTimeHome = request.HalfTimeHomeScore ?? 0,
                HalfTimeAway = request.HalfTimeAwayScore ?? 0,
                FullTimeAway = request.FinalAwayScore ?? 0,
                FullTimeHome = request.FinalHomeScore ?? 0,
                Action = request.ActionName,
            };

            GetResourceResultAndBetStatusRefund(request, criteria);

            await repository.ExecuteAsync(criteria);

            var result = new Result
            {
                ErrMsg = criteria.ErrMsg,
                ErrCode = criteria.ErrCode
            };

            if (result.IsSuccessful && request.IsApplyHedging)
            {
                RefundHedgeMatch(request, criteria);
                criteria.MatchId = request.HedgeMatchId;
                await repository.ExecuteAsync(criteria);
            }

            return result;
        }

        private void RefundHedgeMatch(RefundRequest request, RefundCriteria criteria)
        {
            if (!request.ActionName.Equals(ActionType.RefundHalfTime) && request.IsDeterminedHedgeMatch)
            {
                criteria.SDTRecord -= SettleAbandonedMatchIbcValue;
                criteria.ResourceResult = string.Empty;
            }
        }

        private void GetResourceResultAndBetStatusRefund(RefundRequest request, RefundCriteria criteria)
        {
            var goalCondition = mapper.Map<RefundRequest, GoalCondition>(request);
            var resources = new List<XmlResource>();
            var actionName = request.ActionName;

            var isAbandonedMatch = IsAbandonedMatch(request);

            if (!actionName.Equals(ActionType.RefundHalfTime) && isAbandonedMatch)
            {
                goalCondition.GoalRecord = request.GoalRecord;
                resources = actionName.Equals(ActionType.RefundFullTime) ? resourceService.FullTimeResourcesSettleDetermined(goalCondition) :
                                        resourceService.AllResourcesSettleDetermined(goalCondition);
                criteria.BetStatus = betStatusAllService.GetBetStatusRefund(request);
                AbandonedFinalValue(request, criteria);
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

            criteria.ResourceResult = resources.Count > 0
                ? xmlConvertService.Serialize(new XmlResults { Resources = resources })
                : string.Empty;
        }

        private byte SdtRecord(RefundRequest request)
        {
            var sdtRecord = new int();
            var dictionary = new Dictionary<int, bool>
            {
                { 1, request.IsSettleAbandonedMatchBetDaq},
                { 2, request.IsSettleAbandonedMatchBetFair },
                { 4, request.IsSettleAbandonedMatchIbc },
                { 8, request.ExcludeTicketBetDaqInRefund },
                { 16, request.ExcludeTicketBetFairInRefund }
            };
            foreach (var item in dictionary)
            {
                if (item.Value)
                {
                    sdtRecord += item.Key;
                }
            }

            return (byte)sdtRecord;
        }

        private bool IsAbandonedMatch(RefundRequest request)
        {
            return request.IsSettleAbandonedMatchIbc || request.IsSettleAbandonedMatchBetDaq || request.IsSettleAbandonedMatchBetFair;
        }

        private void AbandonedFinalValue(RefundRequest request, RefundCriteria criteria)
        {
            if (request.ActionName.Equals(ActionType.RefundAll))
            {
                criteria.FullTimeAway = request.HalfTimeAwayScore ?? 0;
                criteria.FullTimeHome = request.HalfTimeHomeScore ?? 0;
            }
        }
    }
}