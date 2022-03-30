using System.Collections.Generic;
using AutoMapper;
using AutoMapper.Configuration;
using Fanex.NAP.Client;
using Fanex.NAP.Client.Helpers.Web;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using NSubstitute;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Requests;
using Settlement.Sportsbook.Aio.Services;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Models;
using Xunit;

namespace Settlement.Sportsbook.Aio.UnitTests.Services
{
    public class CreateQueryServiceTests
    {
        private readonly XmlConvertService xmlConvertService;

        private readonly INapSession currentSession;

        private readonly IHttpContextAccessor accessor;

        private readonly ICreateQueryService service;

        private readonly ILogService logService;

        public CreateQueryServiceTests()
        {
            xmlConvertService = Substitute.For<XmlConvertService>();
            currentSession = Substitute.For<INapSession>();
            accessor = Substitute.For<IHttpContextAccessor>();
            var context = new DefaultHttpContext();
            context.Connection.RemoteIpAddress = new System.Net.IPAddress(1);
            accessor.HttpContext = context;
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<SportsbookAioAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            logService = Substitute.For<ILogService>();
            service = new CreateQueryServiceImp(xmlConvertService, currentSession, accessor, mapper, logService);
        }

        [Fact]
        public void QuerySettle_Always_ReturnsExpectedData()
        {
            // Arrange
            var request = new SettleRequest
            {
                MatchId = 1,
                ActionName = "Settle",
                BetStatus = string.Empty,
                IsLeader = false
            };

            var expectedData = new SettleCriteria
            {
                MatchId = request.MatchId,
                AdminId = 0,
                Action = request.ActionName,
                Ip = "1.0.0.0",
                BetStatus = "",
                SelectedResources = "",
                IsReSettledTickets = false,
                IsLeader = false,
            };

            // Act
            var result = service.QuerySettle(request);

            // Assert
            Assert.Equal(JsonConvert.SerializeObject(expectedData), JsonConvert.SerializeObject(result));
        }

        [Fact]
        public void QuerySaveScore__Always_ReturnsExpectedData()
        {
            // Arrange
            var request = new SaveScoreRequest
            {
                MatchId = 1,
            };

            var expectedData = new SaveScoreRequest
            {
                MatchId = request.MatchId,
                UserId = currentSession.UserId,
                OutsideSources = "",
                Sources = "",
                Ip = "1.0.0.0",
                IsTrader = false
            };

            var result = service.QuerySaveScore(request);

            Assert.Equal(JsonConvert.SerializeObject(expectedData), JsonConvert.SerializeObject(result));
        }

        [Fact]
        public void WriteLogChildMatch__CriteriaExistError_WriteLog()
        {
            var criteria = new SettleCriteria
            {
                MatchId = 1,
                ErrMsg = "Message"
            };

            service.WriteLogChildMatch(criteria);

            Assert.Equal("", criteria.ErrMsg);
            logService.Received(1).ActionLog(Arg.Any<int>(), Arg.Any<string>(), 100);
        }

        [Fact]
        public void QuerySettleChildMatch_Always_ReturnExpectedData()
        {
            var request = new SettleChildMatchRequest
            {
                ActionName = "Calc",
            };

            var expectedData = new SettleCriteria
            {
                Action = request.ActionName,
                AdminId = currentSession.UserId,
                BetStatus = null,
                SelectedResources = "",
                Ip = "1.0.0.0",
                IsDirectly = false
            };

            var result = service.QuerySettleChildMatch(request);

            Assert.Equal(JsonConvert.SerializeObject(expectedData), JsonConvert.SerializeObject(result));
        }

        [Fact]
        public void QueryRecalResult_Always_ReturnExpectedData()
        {
            var request = new GetRecalResultRequest
            {
                MatchId = 1,
                SportType = 1
            };

            var expectedData = new GetRecalResultCriteria
            {
                MatchId = request.MatchId,
                SportType = request.SportType
            };

            var result = service.QueryRecalResult(request);

            Assert.Equal(JsonConvert.SerializeObject(expectedData), JsonConvert.SerializeObject(result));
        }

        [Fact]
        public void QueryChangeSetting_Always_ReturnExpectedData()
        {
            var request = new ResultSettingRequest
            {
                MatchId = 1,
                IsEnabled = true,
                ResourceIds = "",
                Type = 2
            };

            var expectedData = new ResultSettingCriteria
            {
                MatchId = request.MatchId,
                IsEnabled = request.IsEnabled,
                Type = request.Type,
                AdminId = currentSession.UserId,
                ResourceIds = request.ResourceIds
            };

            var result = service.QueryChangeSetting(request);

            Assert.Equal(JsonConvert.SerializeObject(expectedData), JsonConvert.SerializeObject(result));
        }

        [Fact]
        public void CreateMatchResources_Always_ReturnExpectedData()
        {
            var ListResources = new List<CheckOddsItem>
            {
                new CheckOddsItem { MatchId = 1},
                new CheckOddsItem { MatchId = 2}
            };

            var resources = new Resources<CheckOddsItem>
            {
                ResourceItems = ListResources
            };

            var expectedData = xmlConvertService.Serialize(resources);

            var result = service.CreateMatchResources(ListResources);

            Assert.Equal(expectedData, result);
        }

        [Fact]
        public void CreateResourceChildMatch_Always_ReturnExpectedData()
        {
            var childMatch = new ChildMatchModel
            {
                ResourceId = "0001"
            };

            var resources = new Resources<ResourceItem>
            {
                ResourceItems = new List<ResourceItem> { new ResourceItem { ResourceId = childMatch.ResourceId } }
            };

            var expectedData = xmlConvertService.Serialize(resources);

            var result = service.CreateResourceChildMatch(childMatch);

            Assert.Equal(expectedData, result);
        }
    }
}