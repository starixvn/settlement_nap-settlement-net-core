using System.Collections.Generic;
using System.Text;
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

        Task<Result> CheckStatus(CheckStatusRequest request);

        Task<UndoCheckingModel> UndoCheckingScore(int matchId);

        Task<Result> PushInstantCalculation(InstantCalculationRequest request);
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

        private readonly IInstantResourceService instantResourceService;

        public CalculateServiceImp(
            IDynamicRepository repository,
            INapSession currentSession,
            IMapper mapper,
            IHttpContextAccessor accessor,
            ISoccerBetStatusService soccerBetStatusService,
            XmlConvertService xmlConvertService,
            IResourceService resourceService,
            IInstantResourceService instantResourceService)
        {
            this.repository = repository;
            this.currentSession = currentSession;
            this.mapper = mapper;
            this.accessor = accessor;
            this.soccerBetStatusService = soccerBetStatusService;
            this.xmlConvertService = xmlConvertService;
            this.resourceService = resourceService;
            this.instantResourceService = instantResourceService;
        }

        public async Task<Result> Calculate(SettleRequest request)
        {
            GenerateBetStatus(request);
            var criteria = mapper.Map<SettleRequest, CalculateCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            criteria.ResourceResult = GetResource(request);
            SetScoreCriteria(request, criteria);
            var result = await Execute(criteria);

            if (result.IsSuccessful && request.IsApplyHedging)
            {
                criteria.MatchId = request.HedgeMatchId;
                await Execute(criteria);
            }

            return result;
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

        public async Task<UndoCheckingModel> UndoCheckingScore(int matchId)
        {
            var criteria = new UndoCheckingCriteria { MatchId = matchId };
            var undoCheckingScore = await repository.GetAsync<UndoCheckingModel>(criteria);
            undoCheckingScore.ErrCode = criteria.ErrCode;
            undoCheckingScore.ErrMsg = criteria.ErrMsg;

            return undoCheckingScore;
        }

        public async Task<Result> PushInstantCalculation(InstantCalculationRequest request)
        {
            var resourceResult = GetResource(request);
            var criteria = mapper.Map<InstantCalculationRequest, PushInstantCalculationCriteria>(request);

            criteria.ResourceResult = resourceResult;
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            await repository.ExecuteAsync(criteria);

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }

        private string GetResource(InstantCalculationRequest request)
        {
            var goalCondition = new InstantGoalCondition
            {
                GoalRecord = request.GoalRecord,
                FirstGoalValue = request.FirstGoalValue,
                IsExistFgNg = request.IsExistFgNg,
                IsExistHtFgNg = request.IsExistHtFgNg,
                IsHalfTime = request.IsHalfTime
            };

            List<XmlResource> resources;

            if (request.Action.Equals(ActionType.Uncalculate))
            {
                resources = instantResourceService.UnCalculate(goalCondition);
            }
            else if (request.IsHalfTime)
            {
                resources = instantResourceService.Halftime(goalCondition);
            }
            else
            {
                resources = instantResourceService.FullTime(goalCondition);
            }

            return resources.Count > 0
                ? xmlConvertService.Serialize(new XmlResults { Resources = resources })
                : string.Empty;
        }

        private void SetScoreCriteria(SettleRequest request, CalculateCriteria criteria)
        {
            criteria.HalfTimeHome = request.HalfTimeHomeScore ?? 0;
            criteria.HalfTimeAway = request.HalfTimeAwayScore ?? 0;
            
            if (request.ActionName.Equals(ActionType.CalculateFullTime) || request.ActionName.Equals(ActionType.CalculateAll))
            {
                criteria.FullTimeHome = request.FinalHomeScore ?? 0;
                criteria.FullTimeAway = request.FinalAwayScore ?? 0;
            }
        }

        private void GenerateBetStatus(SettleRequest request)
        {
            var betStatus = soccerBetStatusService.CreateBetStatus(request);
            request.BetStatus = new StringBuilder().Append(betStatus).ToString();
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

        private string GetResource(SettleRequest request)
        {
            var goalCondition = mapper.Map<SettleRequest, GoalCondition>(request);
            var actionName = request.ActionName;
            List<XmlResource> resources;

            if (actionName.Equals(ActionType.CalculateHalfTime))
            {
                resources = resourceService.HalftimeResources(goalCondition, SettlementStatus.Completed);
            }
            else if (actionName.Equals(ActionType.CalculateFullTime))
            {
                resources = resourceService.FullTimeResources(goalCondition, SettlementStatus.Completed);
            }
            else if (actionName.Equals(ActionType.CalculateAll))
            {
                resources = resourceService.AllResources(goalCondition, SettlementStatus.Completed);
            }
            else
            {
                resources = resourceService.UnCalculateResources(goalCondition);
            }

            return resources.Count > 0
                ? xmlConvertService.Serialize(new XmlResults { Resources = resources })
                : string.Empty;
        }
    }
}