using AutoMapper;
using Fanex.NAP.Client.Helpers.Web;
using Kaden.Extensions;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;
using Settlement.Sportsbook.Aio.Criterias;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Aio.Services
{
    public interface ICreateQueryService
    {
        SettleCriteria QuerySettle(SettleRequest request);

        RefundParlayCriteria QueryRefundParlay(RefundParlayRequest request);

        SaveScoreCriteria QuerySaveScore(SaveScoreRequest request);
    }

    public class CreateQueryServiceImp : ICreateQueryService
    {
        private readonly XmlConvertService xmlConvertService;

        private readonly INapSession currentSession;

        private readonly IHttpContextAccessor accessor;

        private readonly IMapper mapper;

        public CreateQueryServiceImp(XmlConvertService xmlConvertService,
                                    INapSession currentSession,
                                    IHttpContextAccessor accessor,
                                    IMapper mapper)
        {
            this.xmlConvertService = xmlConvertService;
            this.currentSession = currentSession;
            this.accessor = accessor;
            this.mapper = mapper;
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

        private string CreateResources(List<ResourceItem> selectedResources)
        {
            var resources = new Resources<ResourceItem>
            {
                ResourceItems = selectedResources
            };

            return xmlConvertService.Serialize(resources);
        }

        public RefundParlayCriteria QueryRefundParlay(RefundParlayRequest request)
        {
            var criteria = mapper.Map<RefundParlayRequest, RefundParlayCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            return criteria;
        }

        public SaveScoreCriteria QuerySaveScore(SaveScoreRequest request)
        {
            var scoreToSaveResources = CreateScoreResources(request.ScoresToSave);
            var scoreResources = CreateScoreResources(request.CheckedScores);
            return new SaveScoreCriteria
            {
                MatchId = request.MatchId,
                UserId = currentSession.UserId,
                OutsideSources = scoreToSaveResources,
                Sources = scoreResources,
                Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString()
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
    }
}
