using AutoMapper;
using Fanex.NAP.Client.Helpers.Web;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using System.Collections.Generic;
using Settlement.Core.Models;
using Settlement.Core.Services;

namespace Settlement.Sportsbook.Aio.Services
{
    public interface ICreateQueryService
    {
        SettleCriteria QuerySettle(SettleRequest request);

        SaveScoreRequest QuerySaveScore(SaveScoreRequest request);

        SettleCriteria QuerySettleChildMatch(SettleChildMatchRequest request);

        ResultSettingCriteria QueryChangeSetting(ResultSettingRequest request);

        string CreateResourceChildMatch(ChildMatchModel childMatch);

        string CreateResources(List<ResourceItem> selectedResources);

        string CreateMatchResources(List<CheckOddsItem> selectedResources);

        GetRecalResultCriteria QueryRecalResult(GetRecalResultRequest request);

        void WriteLogChildMatch(SettleCriteria criteria, Result result);
    }

    public class CreateQueryServiceImp : ICreateQueryService
    {
        private readonly XmlConvertService xmlConvertService;

        private readonly INapSession currentSession;

        private readonly IHttpContextAccessor accessor;

        private readonly IMapper mapper;

        private readonly ILogService logService;

        public CreateQueryServiceImp(XmlConvertService xmlConvertService,
                                    INapSession currentSession,
                                    IHttpContextAccessor accessor,
                                    IMapper mapper,
                                    ILogService logService)
        {
            this.xmlConvertService = xmlConvertService;
            this.currentSession = currentSession;
            this.accessor = accessor;
            this.mapper = mapper;
            this.logService = logService;
        }

        public SettleCriteria QuerySettle(SettleRequest request)
        {
            var resourcesResult = CreateResources(request.SelectedResources);
            var criteria = mapper.Map<SettleRequest, SettleCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            criteria.SelectedResources = resourcesResult;
            return criteria;
        }

        public string CreateMatchResources(List<CheckOddsItem> selectedResources)
        {
            var resources = new Resources<CheckOddsItem>
            {
                ResourceItems = selectedResources
            };

            return xmlConvertService.Serialize(resources);
        }

        public SettleCriteria QuerySettleChildMatch(SettleChildMatchRequest request)
        {
            var resourcesResult = CreateResources(request.SelectedResources);
            var criteria = mapper.Map<SettleChildMatchRequest, SettleCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            criteria.SelectedResources = resourcesResult;
            return criteria;
        }

        public string CreateResources(List<ResourceItem> selectedResources)
        {
            var resources = new Resources<ResourceItem>
            {
                ResourceItems = selectedResources
            };

            return xmlConvertService.Serialize(resources);
        }

        public string CreateResourceChildMatch(ChildMatchModel childMatch)
        {
            var resource = new Resources<ResourceItem>
            {
                ResourceItems = new List<ResourceItem> { mapper.Map<ChildMatchModel, ResourceItem>(childMatch) }
            };

            return xmlConvertService.Serialize(resource);
        }

        public SaveScoreRequest QuerySaveScore(SaveScoreRequest request)
        {
            var scoreToSaveResources = CreateScoreResources(request.ScoresToSave);
            var scoreResources = CreateScoreResources(request.CheckedScores);
            return new SaveScoreRequest
            {
                MatchId = request.MatchId,
                UserId = currentSession.UserId,
                OutsideSources = scoreToSaveResources,
                Sources = scoreResources,
                Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
                ApiKey = request.ApiKey,
                IsTrader = request.IsTrader
            };
        }

        private string CreateScoreResources(List<SaveScoreModel> selectedResources)
        {
            var resources = new SaveScoreResources<SaveScoreModel>
            {
                SourceItems = selectedResources
            };

            return xmlConvertService.Serialize(resources);
        }

        public ResultSettingCriteria QueryChangeSetting(ResultSettingRequest request)
        {
            var criteria = new ResultSettingCriteria
            {
                MatchId = request.MatchId,
                IsEnabled = request.IsEnabled,
                Type = request.Type,
                ResourceIds = request.ResourceIds,
                AdminId = currentSession.UserId
            };

            return criteria;
        }

        public GetRecalResultCriteria QueryRecalResult(GetRecalResultRequest request)
        {
            var criteria = mapper.Map<GetRecalResultRequest, GetRecalResultCriteria>(request);
            return criteria;
        }

        public void WriteLogChildMatch(SettleCriteria criteria, Result result)
        {
            if (!string.IsNullOrWhiteSpace(result.ErrMsg))
            {
                const int actionCalculate = 100;
                logService.ActionLog(criteria.MatchId, result.ErrMsg, actionCalculate);
            }
        }
    }
}