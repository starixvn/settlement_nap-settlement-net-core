using System.Collections.Generic;
using System.Threading.Tasks;
using Fanex.Data.Repository;
using AutoMapper;
using Fanex.NAP.Client.Helpers.Web;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Xunit;
using AutoMapper.Configuration;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Criterias;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services
{
    public class CalculateServiceTests
    {
        private readonly IDynamicRepository repository;

        private readonly INapSession currentSession;

        private readonly IHttpContextAccessor accessor;

        private readonly ISoccerBetStatusService soccerBetStatusService;

        private readonly XmlConvertService xmlConvertService;

        private readonly IResourceService resourceService;

        private readonly ICalculateService service;

        public CalculateServiceTests()
        {
            repository = Substitute.For<IDynamicRepository>();
            currentSession = Substitute.For<INapSession>();
            accessor = Substitute.For<IHttpContextAccessor>();
            soccerBetStatusService = Substitute.For<ISoccerBetStatusService>();
            xmlConvertService = Substitute.For<XmlConvertService>();
            resourceService = Substitute.For<IResourceService>();
            var context = new DefaultHttpContext();
            context.Connection.RemoteIpAddress = new System.Net.IPAddress(1);
            accessor.HttpContext = context;
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<SoccerAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            service = new CalculateServiceImp(repository, currentSession, mapper, accessor, soccerBetStatusService, xmlConvertService, resourceService, null);
        }

        [Fact]
        public void CalculateCriteria_ActionHalftime_CallInOrderFunctionOnService()
        {
            // Arrange
            var query = new SettleRequest()
            {
                GoalRecord = "AH",
                ActionName = ActionType.CalculateHalfTime
            };

            resourceService.HalftimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>())
                .Returns(new List<XmlResource>());

            // Act
            service.Calculate(query);

            // Assert
            Received.InOrder(() =>
            {
                soccerBetStatusService.Received().CreateBetStatus(Arg.Any<SettleRequest>());
                resourceService.Received().HalftimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>());
            });
        }

        [Fact]
        public void CalculateCriteria_ActionFullTime_CallInOrderFunctionOnService()
        {
            // Arrange
            var query = new SettleRequest
            {
                GoalRecord = "AH",
                ActionName = ActionType.CalculateFullTime
            };
            resourceService.FullTimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>()).Returns(new List<XmlResource>());

            // Act
            service.Calculate(query);

            // Assert
            Received.InOrder(() =>
            {
                soccerBetStatusService.Received().CreateBetStatus(Arg.Any<SettleRequest>());
                resourceService.Received().FullTimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>());
            });
        }

        [Fact]
        public void CalculateCriteria_IsSoccerAndActionAll_CallInOrderFunctionOnService()
        {
            // Arrange
            var query = new SettleRequest
            {
                GoalRecord = "AH",
                ActionName = ActionType.CalculateAll
            };
            resourceService.AllResources(Arg.Any<GoalCondition>(), Arg.Any<int>()).Returns(new List<XmlResource>());

            // Act
            service.Calculate(query);

            // Assert
            Received.InOrder(() =>
            {
                soccerBetStatusService.Received().CreateBetStatus(Arg.Any<SettleRequest>());
                resourceService.Received().AllResources(Arg.Any<GoalCondition>(), Arg.Any<int>());
            });
        }

        [Theory]
        [InlineData(0, "", true)]
        [InlineData(1, "Error", false)]
        public async Task Settle_Always_ReturnCorrectResult(int errorCode, string errorMsg, bool result)
        {
            var query = new SettleRequest
            {
                GoalRecord = "AH",
                ActionName = ActionType.CalculateAll
            };
            resourceService.AllResources(Arg.Any<GoalCondition>(), Arg.Any<int>()).Returns(new List<XmlResource>());
            repository.ExecuteAsync(Arg.Do<CalculateCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            })).Returns(1);

            var actual = await service.Calculate(query);

            Assert.Equal(result, actual.IsSuccessful);
        }

        [Fact]
        public async Task Settle_ApplyHedgeMatch_ExecuteTwice()
        {
            var query = new SettleRequest
            {
                GoalRecord = "AH",
                ActionName = ActionType.CalculateAll,
                IsApplyHedging = true,
                HedgeMatchId = 123
            };
            resourceService.AllResources(Arg.Any<GoalCondition>(), Arg.Any<int>()).Returns(new List<XmlResource>());
            repository.ExecuteAsync(Arg.Any<CalculateCriteria>()).Returns(1);

            await service.Calculate(query);

            await repository.Received(2).ExecuteAsync(Arg.Any<CalculateCriteria>());
        }

        [Theory]
        [InlineData(0, "", true)]
        [InlineData(1, "Error", false)]
        public async Task CheckMarkedTickets_Always_ReturnCorrectResult(int errorCode, string errorMsg, bool result)
        {
            repository.ExecuteAsync(Arg.Do<CheckStatusCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            })).Returns(1);
            var request = new CheckStatusRequest
            {
                MatchId = 12345,
            };

            var actual = await service.CheckStatus(request);

            Assert.Equal(result, actual.IsSuccessful);
        }
    }
}