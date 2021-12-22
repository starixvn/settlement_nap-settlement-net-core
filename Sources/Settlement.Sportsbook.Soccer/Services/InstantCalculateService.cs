using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Criterias;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface IInstantCalculateService
    {
        Task<UndoCheckingModel> UndoCheckingScore(int matchId);

        Task<Result> PushInstantCalculation(InstantCalculationRequest request);
    }

    public class InstantCalculateServiceImp : IInstantCalculateService
    {
        private readonly IDynamicRepository repository;

        private readonly INapSession currentSession;

        private readonly IMapper mapper;

        private readonly IHttpContextAccessor accessor;

        private readonly XmlConvertService xmlConvertService;

        private readonly IInstantResourceService instantResourceService;

        public InstantCalculateServiceImp(
            IDynamicRepository repository,
            INapSession currentSession,
            IMapper mapper,
            IHttpContextAccessor accessor,
            XmlConvertService xmlConvertService,
            IInstantResourceService instantResourceService)
        {
            this.repository = repository;
            this.currentSession = currentSession;
            this.mapper = mapper;
            this.accessor = accessor;
            this.xmlConvertService = xmlConvertService;
            this.instantResourceService = instantResourceService;
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
            var criteria = mapper.Map<InstantCalculationRequest, PushInstantCalculationCriteria>(request);
            criteria.ResourceResult = GetResourceResultInstantCalculate(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            await repository.ExecuteAsync(criteria);

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }

        private string GetResourceResultInstantCalculate(InstantCalculationRequest request)
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
    }
}
