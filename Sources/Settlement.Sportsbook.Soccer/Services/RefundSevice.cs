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
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

        private readonly IConfiguration configuration;

        public RefundServiceImp(
            IDynamicRepository repository,
            INapSession currentSession,
            IMapper mapper,
            IHttpContextAccessor accessor,
            XmlConvertService xmlConvertService,
            IResourceService resourceService,
            IBetStatusAllService betStatusAllService,
            IConfiguration configuration)
        {
            this.repository = repository;
            this.currentSession = currentSession;
            this.mapper = mapper;
            this.accessor = accessor;
            this.xmlConvertService = xmlConvertService;
            this.resourceService = resourceService;
            this.betStatusAllService = betStatusAllService;
            this.configuration = configuration;
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

            var validationResult = await ValidateBeforePushing(criteria);
            if (validationResult.ErrCode > 0)
            {
                return validationResult;
            }

            ExecuteRefund(criteria);
            RefundHedgeMatch(request, criteria);

            return validationResult;
        }

        private void RefundHedgeMatch(RefundRequest request, RefundCriteria criteria)
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
                ExecuteRefund(criteria);
            }
        }

        private async Task<Result> ValidateBeforePushing(RefundCriteria criteria)
        {
            var validateEvent = await ValidateEvent(criteria);

            if (validateEvent.ErrCode > 0)
            {
                return validateEvent;
            }

            var validateTicket = await ValidateTicket(criteria);

            if (validateTicket.ErrCode > 0)
            {
                return validateTicket;
            }

            return new Result();
        }

        private async Task<Result> ValidateTicket(RefundCriteria criteria)
        {
            var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();
            var checkingCriteria = new ValidateBeforePushCriteria
            {
                MatchId = criteria.MatchId,
                SpName = criteria.SpName,
                Action = criteria.Action,
                Mode = ActionKey.ActionDictionary[criteria.Action],
                SDTRecord = criteria.SDTRecord
            };
            foreach (var server in servers)
            {
                checkingCriteria.DbServer = server;
                await repository.ExecuteAsync(checkingCriteria);
                if (checkingCriteria.ErrCode > 0)
                {
                    return new Result
                    {
                        ErrCode = checkingCriteria.ErrCode,
                        ErrMsg = checkingCriteria.ErrMsg
                    };
                }
            }

            return new Result();
        }

        private async Task<Result> ValidateEvent(RefundCriteria criteria)
        {
            var checkEventCriteria = new ValidateEventCriteria
            {
                MatchId = criteria.MatchId,
                SpName = criteria.SpName,
                Action = criteria.Action,
                Mode = ActionKey.ActionDictionary[criteria.Action],
                SDTRecord = criteria.SDTRecord
            };
            await repository.ExecuteAsync(checkEventCriteria);

            if (checkEventCriteria.ErrCode > 0)
            {
                return new Result
                {
                    ErrCode = checkEventCriteria.ErrCode,
                    ErrMsg = checkEventCriteria.ErrMsg
                };
            }

            return new Result();
        }

        private void ExecuteRefund(RefundCriteria criteria)
        {
            var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();

            foreach (var server in servers)
            {
                criteria.DbServer = server;
                repository.Execute(criteria);
            }
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

            var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();
            foreach (var server in servers)
            {
                criteria.DbServer = server;
                await repository.ExecuteAsync(criteria);
                if (criteria.ErrCode > 0)
                {
                    return new Result
                    {
                        ErrCode = criteria.ErrCode,
                        ErrMsg = criteria.ErrMsg
                    };
                }
            }

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

            var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();
            foreach (var server in servers)
            {
                criteria.DbServer = server;
                await repository.ExecuteAsync(criteria);
                if (criteria.ErrCode > 0)
                {
                    return new Result
                    {
                        ErrCode = criteria.ErrCode,
                        ErrMsg = criteria.ErrMsg
                    };
                }
            }

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }
    }
}