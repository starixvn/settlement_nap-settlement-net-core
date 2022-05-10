using Fanex.Data.Repository;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.Configuration;
using Fanex.NAP.Client.Helpers.Web;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;
using Settlement.Sportsbook.Soccer.Services;
using NSubstitute;
using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Constants;
using Xunit;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services
{
    public class RefundServiceTests
    {
        private readonly IDynamicRepository repository;

        private readonly INapSession currentSession;

        private readonly IHttpContextAccessor accessor;

        private readonly XmlConvertService xmlConvertService;

        private readonly IResourceService resourceService;

        private readonly IBetStatusAllService betStatusAllService;

        private readonly IRefundService service;

        public RefundServiceTests()
        {
            repository = Substitute.For<IDynamicRepository>();
            currentSession = Substitute.For<INapSession>();
            accessor = Substitute.For<IHttpContextAccessor>();
            betStatusAllService = Substitute.For<IBetStatusAllService>();
            xmlConvertService = Substitute.For<XmlConvertService>();
            resourceService = Substitute.For<IResourceService>();
            var context = new DefaultHttpContext();
            context.Connection.RemoteIpAddress = new System.Net.IPAddress(1);
            accessor.HttpContext = context;
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<SoccerAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            service = new RefundServiceImp(repository, currentSession, mapper, accessor, xmlConvertService, resourceService, betStatusAllService);
        }

        [Theory]
        [InlineData(true)]
        [InlineData(false)]
        public async Task CheckMarkedTickets_Always_ReturnCorrectResult(bool result)
        {
            await repository.ExecuteAsync(Arg.Do<CheckingMarkedTicketsCriteria>(x =>
            {
                x.IsExistMarkedTicket = result;
            }));
            var request = new CheckingMarkedTicketsRequest
            {
                MatchId = 12345,
            };

            var actual = await service.CheckMarkedTickets(request);

            Assert.Equal(result, actual.IsExistMarkedTicket);
        }

        [Fact]
        public async Task RefundRunningThirdPartyTickets_Always_ReturnsTrueAsync()
        {
            // Arrange
            const int errorCode = 1;
            const string errorMsg = "Error";
            await repository.ExecuteAsync(Arg.Do<RefundRunningThirdPartyTicketCriteria>(x => { x.ErrCode = errorCode; x.ErrMsg = errorMsg; }));

            // Act
            var result = await service.RefundRunningThirdPartyTickets(new RefundRunningThirdPartyTicketRequest());

            // Assert
            Assert.True(result.ErrCode == errorCode && result.ErrMsg.Equals(errorMsg));
        }

        [Fact]
        public async Task MoveThirdPartyBetTickets_Always_ReturnsTrueAsync()
        {
            // Arrange
            var request = new MoveBetRequest
            {
                MatchId = 123,
                NewMatchId = 456,
                NewMatchCode = "ABC",
                ActionName = string.Empty
            };

            const int errorCode = 1;
            const string errorMsg = "Error";
            await repository.ExecuteAsync(Arg.Do<MoveThirdPartyBetTicketCriteria>(x => { x.ErrCode = errorCode; x.ErrMsg = errorMsg; }));

            // Act
            var result = await service.MoveThirdPartyBetTickets(request);

            // Assert
            Assert.True(result.ErrCode == errorCode && result.ErrMsg.Equals(errorMsg));
        }

        [Fact]
        public void RefundCriteria_ActionHalftime_CallInOrderFunctionOnService()
        {
            var query = new RefundRequest()
            {
                ActionName = ActionType.RefundHalfTime,
            };

            resourceService.HalftimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>())
                .Returns(new List<XmlResource>());

            service.Refund(query);

            resourceService.Received().HalftimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>());
            repository.Received().ExecuteAsync(Arg.Any<RefundCriteria>());
        }

        [Fact]
        public void RefundCriteria_ActionFullTime_CallInOrderFunctionOnService()
        {
            var query = new RefundRequest()
            {
                ActionName = ActionType.RefundFullTime,
                IsSettleAbandonedMatchIbc = true
            };

            resourceService.FullTimeResourcesSettleDetermined(Arg.Any<GoalCondition>())
                .Returns(new List<XmlResource>());

            service.Refund(query);

            Received.InOrder(() =>
            {
                betStatusAllService.GetBetStatusRefund(Arg.Any<RefundRequest>());
                resourceService.FullTimeResourcesSettleDetermined(Arg.Any<GoalCondition>());
                repository.ExecuteAsync(Arg.Any<RefundCriteria>());
            });
        }

        [Fact]
        public void RefundCriteria_ActionAll_CallInOrderFunctionOnService()
        {
            var query = new RefundRequest()
            {
                ActionName = ActionType.RefundAll,
                IsSettleAbandonedMatchIbc = true
            };

            resourceService.AllResourcesSettleDetermined(Arg.Any<GoalCondition>())
                .Returns(new List<XmlResource>());

            service.Refund(query);

            Received.InOrder(() =>
            {
                betStatusAllService.GetBetStatusRefund(Arg.Any<RefundRequest>());
                resourceService.AllResourcesSettleDetermined(Arg.Any<GoalCondition>());
                repository.ExecuteAsync(Arg.Any<RefundCriteria>());
            });
        }

        [Theory]
        [InlineData(0, "", true)]
        [InlineData(1, "Error", false)]
        public async Task Refund_Always_ReturnCorrectResult(int errorCode, string errorMsg, bool result)
        {
            var query = new RefundRequest
            {
                ActionName = ActionType.RefundAll
            };
            resourceService.AllResources(Arg.Any<GoalCondition>(), Arg.Any<int>()).Returns(new List<XmlResource>());
            await repository.ExecuteAsync(Arg.Do<RefundCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            }));

            var actual = await service.Refund(query);

            Assert.Equal(result, actual.IsSuccessful);
        }

        [Fact]
        public async Task Refund_ApplyHedgeMatch_ExecuteTwice()
        {
            var query = new RefundRequest
            {
                ActionName = ActionType.RefundHalfTime,
                IsApplyHedging = true,
                HedgeMatchId = 123
            };
            resourceService.HalftimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>()).Returns(new List<XmlResource>());
            await repository.ExecuteAsync(Arg.Any<RefundCriteria>());

            await service.Refund(query);

            await repository.Received(2).ExecuteAsync(Arg.Any<RefundCriteria>());
        }
    }
}