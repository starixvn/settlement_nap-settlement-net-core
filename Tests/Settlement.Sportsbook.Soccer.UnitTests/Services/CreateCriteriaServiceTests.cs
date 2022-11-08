using AutoMapper;
using AutoMapper.Configuration;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services
{
    public class CreateCriteriaServiceTests
    {
        private readonly INapSession currentSession;

        private readonly IHttpContextAccessor accessor;

        private readonly IResourceService resourceService;

        private readonly ISoccerBetStatusService soccerBetStatusService;

        private readonly XmlConvertService xmlConvertService;

        private readonly IBetStatusAllService betStatusAllService;

        private readonly ICreateCriteriaService service;

        public CreateCriteriaServiceTests()
        {
            currentSession = Substitute.For<INapSession>();
            accessor = Substitute.For<IHttpContextAccessor>();
            soccerBetStatusService = Substitute.For<ISoccerBetStatusService>();
            xmlConvertService = Substitute.For<XmlConvertService>();
            resourceService = Substitute.For<IResourceService>();
            betStatusAllService = Substitute.For<IBetStatusAllService>();
            var context = new DefaultHttpContext
            {
                Connection =
                {
                    RemoteIpAddress = new System.Net.IPAddress(1)
                }
            };
            accessor.HttpContext = context;

            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<SoccerAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            service = new CreateCriteriaServiceImp(currentSession, resourceService, accessor, soccerBetStatusService,
                xmlConvertService, mapper, betStatusAllService);
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
                .Returns(new List<XmlResource> { new XmlResource() });

            // Act
            service.CreateCalculateCriteria(query);

            // Assert
            Received.InOrder(() =>
            {
                resourceService.Received().HalftimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>());
                xmlConvertService.Received().Serialize(Arg.Any<XmlResults>());
                soccerBetStatusService.Received().CreateBetStatus(Arg.Any<SettleRequest>());
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
            resourceService.FullTimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>()).Returns(new List<XmlResource> { new XmlResource() });

            // Act
            service.CreateCalculateCriteria(query);

            // Assert
            Received.InOrder(() =>
            {
                resourceService.Received().FullTimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>());
                xmlConvertService.Received().Serialize(Arg.Any<XmlResults>());
                soccerBetStatusService.Received().CreateBetStatus(Arg.Any<SettleRequest>());
            });
        }

        [Fact]
        public void CalculateCriteria_ActionAll_CallInOrderFunctionOnService()
        {
            // Arrange
            var query = new SettleRequest
            {
                GoalRecord = "AH",
                ActionName = ActionType.CalculateAll,
            };
            resourceService.AllResources(Arg.Any<GoalCondition>(), Arg.Any<int>()).Returns(new List<XmlResource> { new XmlResource() });

            // Act
            service.CreateCalculateCriteria(query);

            // Assert
            Received.InOrder(() =>
            {
                resourceService.Received().AllResources(Arg.Any<GoalCondition>(), Arg.Any<int>());
                xmlConvertService.Received().Serialize(Arg.Any<XmlResults>());
                soccerBetStatusService.Received().CreateBetStatus(Arg.Any<SettleRequest>());
            });
        }

        [Fact]
        public void CreateRefundCriteria_RefundFullTimeAndMatchAbandoned_CallInOrderFunctionOnService()
        {
            // Arrange
            var query = new RefundRequest
            {
                ActionName = ActionType.RefundFullTime,
                IsSettleAbandonedMatchIbc = true
            };
            resourceService.FullTimeResourcesSettleDetermined(Arg.Any<GoalCondition>()).Returns(new List<XmlResource> { new XmlResource() });

            // Act
            service.CreateRefundCriteria(query);

            // Assert
            Received.InOrder(() =>
            {
                betStatusAllService.Received().GetBetStatusRefund(Arg.Any<RefundRequest>());
                resourceService.Received().FullTimeResourcesSettleDetermined(Arg.Any<GoalCondition>());
                xmlConvertService.Received().Serialize(Arg.Any<XmlResults>());
            });
        }

        [Fact]
        public void CreateRefundCriteria_RefundAllNotAbandoned_CallInOrderFunctionOnService()
        {
            // Arrange
            var query = new RefundRequest { ActionName = ActionType.RefundAll, BetStatus = "123" };
            resourceService.AllResources(Arg.Any<GoalCondition>(), Arg.Any<int>()).Returns(new List<XmlResource> { new XmlResource() });

            // Act
            var criteria = service.CreateRefundCriteria(query);

            // Assert
            Received.InOrder(() =>
            {
                resourceService.Received().AllResources(Arg.Any<GoalCondition>(), Arg.Any<int>());
                xmlConvertService.Received().Serialize(Arg.Any<XmlResults>());
            });

            Assert.Equal("123", criteria.BetStatus);
        }

        [Fact]
        public void CreateRefundCriteria_RefundAllAndMatchAbandoned_CallInOrderFunctionOnService()
        {
            // Arrange
            var query = new RefundRequest
            {
                ActionName = ActionType.RefundAll,
                IsSettleAbandonedMatchIbc = true,
                HalfTimeAwayScore = 1,
                HalfTimeHomeScore = 2,
            };
            resourceService.AllResourcesSettleDetermined(Arg.Any<GoalCondition>()).Returns(new List<XmlResource> { new XmlResource() });

            // Act
            var criteria = service.CreateRefundCriteria(query);

            // Assert
            Received.InOrder(() =>
            {
                betStatusAllService.Received().GetBetStatusRefund(Arg.Any<RefundRequest>());
                resourceService.Received().AllResourcesSettleDetermined(Arg.Any<GoalCondition>());
                xmlConvertService.Received().Serialize(Arg.Any<XmlResults>());
            });
            Assert.Equal(1, criteria.FullTimeAway);
            Assert.Equal(2, criteria.FullTimeHome);
        }

        [Fact]
        public void CreateRefundCriteria_RefundFullTimeNotAbandoned_CallInOrderFunctionOnService()
        {
            // Arrange
            var query = new RefundRequest
            {
                ActionName = ActionType.RefundFullTime,
                BetStatus = "123",
                HalfTimeAwayScore = 1,
                HalfTimeHomeScore = 2,
            };
            resourceService.FullTimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>()).Returns(new List<XmlResource> { new XmlResource() });

            // Act
            var criteria = service.CreateRefundCriteria(query);

            // Assert
            Received.InOrder(() =>
            {
                resourceService.Received().FullTimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>());
                xmlConvertService.Received().Serialize(Arg.Any<XmlResults>());
            });

            Assert.Equal("123", criteria.BetStatus);
            Assert.Equal(0, criteria.FullTimeAway);
            Assert.Equal(0, criteria.FullTimeHome);
        }

        [Fact]
        public void CreateRefundCriteria_RefundHaflTime_CallInOrderFunctionOnService()
        {
            // Arrange
            var query = new RefundRequest
            {
                ActionName = ActionType.RefundHalfTime,
                BetStatus = "123",
                HalfTimeAwayScore = 1,
                HalfTimeHomeScore = 2,
            };
            resourceService.HalftimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>()).Returns(new List<XmlResource> { new XmlResource() });

            // Act
            var criteria = service.CreateRefundCriteria(query);

            // Assert
            Received.InOrder(() =>
            {
                resourceService.Received().HalftimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>());
                xmlConvertService.Received().Serialize(Arg.Any<XmlResults>());
            });

            Assert.Empty(criteria.BetStatus);
            Assert.Equal(0, criteria.FullTimeAway);
            Assert.Equal(0, criteria.FullTimeHome);
        }
    }
}