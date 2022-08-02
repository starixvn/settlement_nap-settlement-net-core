using AutoMapper;
using Fanex.NAP.Client.Helpers.Web;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface ICreateCriteriaService
    {
        public CalculateCriteria CreateCalculateCriteria(SettleRequest request);

        public CalculateCriteria CreateUnCalculateCriteria(SettleRequest request);

        public CalculateEarlyCriteria CreateCalculateEarlyCriteria(SettleEarlyRequest request);
    }

    public class CreateCriteriaServiceImp : ICreateCriteriaService
    {
        private readonly IMapper mapper;

        private readonly INapSession currentSession;

        private readonly IHttpContextAccessor accessor;

        private readonly IResourceService resourceService;

        private readonly ISoccerBetStatusService soccerBetStatusService;

        private readonly XmlConvertService xmlConvertService;

        public CreateCriteriaServiceImp(INapSession currentSession,
            IResourceService resourceService,
            IHttpContextAccessor accessor,
            ISoccerBetStatusService soccerBetStatusService,
            XmlConvertService xmlConvertService,
            IMapper mapper)
        {
            this.currentSession = currentSession;
            this.resourceService = resourceService;
            this.accessor = accessor;
            this.soccerBetStatusService = soccerBetStatusService;
            this.xmlConvertService = xmlConvertService;
            this.mapper = mapper;
        }

        public CalculateCriteria CreateCalculateCriteria(SettleRequest request)
        {
            var criteria = new CalculateCriteria
            {
                AdminId = currentSession.UserId,
                MatchId = request.MatchId,
                GoalRecord = string.IsNullOrWhiteSpace(request.GoalRecord) ? string.Empty : request.GoalRecord.ToUpperInvariant(),
                ResourceResult = GetResourceResultCalculate(request),
                BetStatus = soccerBetStatusService.CreateBetStatus(request),
                Action = request.ActionName,
                HalfTimeHome = request.HalfTimeHomeScore ?? 0,
                HalfTimeAway = request.HalfTimeAwayScore ?? 0,
                Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
                IsReSettledTickets = request.IsReSettledTickets,
                ChildMatchIds = request.ChildMatchIds
            };

            if (request.ActionName.Equals(ActionType.CalculateFullTime) || request.ActionName.Equals(ActionType.CalculateAll))
            {
                criteria.FullTimeHome = request.FinalHomeScore ?? 0;
                criteria.FullTimeAway = request.FinalAwayScore ?? 0;
            }

            return criteria;
        }

        public CalculateCriteria CreateUnCalculateCriteria(SettleRequest request)
        {
            var criteria = new CalculateCriteria
            {
                AdminId = currentSession.UserId,
                MatchId = request.MatchId,
                GoalRecord = string.IsNullOrWhiteSpace(request.GoalRecord) ? string.Empty : request.GoalRecord.ToUpperInvariant(),
                ResourceResult = GetResourceResultUnCalculate(request),
                BetStatus = string.Empty,
                Action = request.ActionName,
                HalfTimeHome = request.HalfTimeHomeScore ?? 0,
                HalfTimeAway = request.HalfTimeAwayScore ?? 0,
                Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
                IsReSettledTickets = request.IsReSettledTickets,
                ChildMatchIds = request.ChildMatchIds
            };

            return criteria;
        }

        public CalculateEarlyCriteria CreateCalculateEarlyCriteria(SettleEarlyRequest request)
        {
            var criteria = new CalculateEarlyCriteria
            {
                AdminId = currentSession.UserId,
                MatchId = request.MatchId,
                Action = request.ActionName,
                Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
                IsReSettledTickets = request.IsReSettledTickets,
                SelectedResources = CreateResources(request.SelectedResources)
            };

            return criteria;
        }

        private string CreateResources(List<ResourceItem> selectedResources)
        {
            var resources = new Resources<ResourceItem>
            {
                ResourceItems = selectedResources
            };

            return xmlConvertService.Serialize(resources);
        }

        private string GetResourceResultCalculate(SettleRequest request)
        {
            var goalCondition = mapper.Map<SettleRequest, GoalCondition>(request);
            var actionName = request.ActionName;
            var resources = actionName switch
            {
                ActionType.CalculateHalfTime => resourceService.HalftimeResources(goalCondition, SettlementStatus.Completed),
                ActionType.CalculateFullTime => resourceService.FullTimeResources(goalCondition, SettlementStatus.Completed),
                _ => resourceService.AllResources(goalCondition, SettlementStatus.Completed),
            };

            return resources.Count > 0
                ? xmlConvertService.Serialize(new XmlResults { Resources = resources })
                : string.Empty;
        }

        private string GetResourceResultUnCalculate(SettleRequest request)
        {
            var goalCondition = mapper.Map<SettleRequest, GoalCondition>(request);
            var resources = resourceService.UnCalculateResources(goalCondition);

            return resources.Count > 0
                ? xmlConvertService.Serialize(new XmlResults { Resources = resources })
                : string.Empty;
        }
    }
}