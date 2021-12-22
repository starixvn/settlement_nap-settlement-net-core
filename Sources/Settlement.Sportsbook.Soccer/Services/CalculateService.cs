using System.Threading.Tasks;
using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Criterias;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface ICalculateService
    {
        Task<Result> Calculate(SettleRequest request);

        Task<Result> UnCalculate(SettleRequest request);

        Task<Result> CheckStatus(CheckStatusRequest request);
    }

    public class CalculateServiceImp : ICalculateService
    {
        private readonly IDynamicRepository repository;

        private readonly INapSession currentSession;

        private readonly IMapper mapper;

        private readonly IHttpContextAccessor accessor;

        private readonly ISoccerBetStatusService soccerBetStatusService;

        private readonly XmlConvertService xmlConvertService;

        private readonly IResourceService resourceService;


        public CalculateServiceImp(
            IDynamicRepository repository,
            INapSession currentSession,
            IMapper mapper,
            IHttpContextAccessor accessor,
            ISoccerBetStatusService soccerBetStatusService,
            XmlConvertService xmlConvertService,
            IResourceService resourceService)
        {
            this.repository = repository;
            this.currentSession = currentSession;
            this.mapper = mapper;
            this.accessor = accessor;
            this.soccerBetStatusService = soccerBetStatusService;
            this.xmlConvertService = xmlConvertService;
            this.resourceService = resourceService;
        }

        public async Task<Result> Calculate(SettleRequest request)
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

            var result = await Execute(criteria);

            if (result.IsSuccessful && request.IsApplyHedging)
            {
                criteria.MatchId = request.HedgeMatchId;
                await Execute(criteria);
            }

            return result;
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

        public async Task<Result> UnCalculate(SettleRequest request)
        {
            var criteria = new CalculateCriteria
            {
                AdminId = currentSession.UserId,
                MatchId = request.MatchId,
                GoalRecord = string.IsNullOrWhiteSpace(request.GoalRecord) ? string.Empty : request.GoalRecord.ToUpperInvariant(),
                ResourceResult = GetResourceResultUnCalculate(request),
                BetStatus =  string.Empty,
                Action = request.ActionName,
                HalfTimeHome = request.HalfTimeHomeScore ?? 0,
                HalfTimeAway = request.HalfTimeAwayScore ?? 0,
                Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
                IsReSettledTickets = request.IsReSettledTickets,
                ChildMatchIds = request.ChildMatchIds
            };

            var result = await Execute(criteria);

            if (result.IsSuccessful && request.IsApplyHedging)
            {
                criteria.MatchId = request.HedgeMatchId;
                await Execute(criteria);
            }

            return result;
        }

        private string GetResourceResultUnCalculate(SettleRequest request)
        {
            var goalCondition = mapper.Map<SettleRequest, GoalCondition>(request);
            var resources = resourceService.UnCalculateResources(goalCondition);

            return resources.Count > 0
                ? xmlConvertService.Serialize(new XmlResults { Resources = resources })
                : string.Empty;
        }

        public async Task<Result> CheckStatus(CheckStatusRequest request)
        {
            var criteria = mapper.Map<CheckStatusRequest, CheckStatusCriteria>(request);

            await repository.ExecuteAsync(criteria);

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }
        
        private async Task<Result> Execute(CalculateCriteria criteria)
        {
            await repository.ExecuteAsync(criteria);

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }
    }
}