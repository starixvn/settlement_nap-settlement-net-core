using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using NSubstitute;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.InstantCalculate;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.Instant
{
    public class InstantCalculateServiceFacts
    {
        private readonly IDynamicRepository repository;

        private readonly INapSession currentSession;

        private readonly IHttpContextAccessor accessor;

        private readonly IInstantResourceService instantResourceService;

        private readonly ScaleOutSettleService scaleOutSettleService;

        private readonly IInstantCalculateService service;

        public InstantCalculateServiceFacts()
        {
            repository = Substitute.For<IDynamicRepository>();
            currentSession = Substitute.For<INapSession>();
            accessor = Substitute.For<IHttpContextAccessor>();
            instantResourceService = Substitute.For<IInstantResourceService>();
            scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
            var context = new DefaultHttpContext();
            context.Connection.RemoteIpAddress = new System.Net.IPAddress(1);
            accessor.HttpContext = context;
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<SoccerAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            var appSettings = new AppSettingsKey { SiteDbServer = new List<string> { "DB01", "DB02", "DB03" } };
            var option = Options.Create(appSettings);
            service = new InstantCalculateServiceImp(repository, currentSession, mapper, accessor, instantResourceService, option, scaleOutSettleService);
        }

        [Fact]
        public async Task CalculateCheckingInfo_ExistError_ReturnsMatchInfoFromRepositoryGet()
        {
            // Arrange
            const int errorCode = 100;
            const string errorMsg = "Error Message";
            repository
                .GetAsync<MatchGoalRecordModel>(Arg.Do<InstantCheckingCriteria>(x =>
                {
                    x.ErrCode = errorCode;
                    x.ErrMsg = errorMsg;
                })).Returns(new MatchGoalRecordModel { IsExistHtFgNg = true });

            // Act
            var actualMatch = await service.CalculateCheckingInfo(new MatchCheckingRequest());

            // Assert
            var expectedMatch = new MatchGoalRecordModel
            {
                ErrCode = errorCode,
                ErrMsg = errorMsg,
                IsExistHtFgNg = true
            };
            Assert.Equal(JsonConvert.SerializeObject(expectedMatch), JsonConvert.SerializeObject(actualMatch));
        }

        [Fact]
        public async Task CalculateCheckingInfo_NotExistError_ReturnsMatchInfoFromRepositoryGet()
        {
            // Arrange
            var matchCheckingCentral = new MatchGoalRecordModel
            {
                GoalRecord = "123",
                BetStatus = "1234",
                IsExistFgNg = true
            };
            var matchCheckingSite = new MatchGoalRecordModel { IsExistHtFgNg = true };

            var matchCheckingSiteSecond = new MatchGoalRecordModel { IsExistFG = true, IsExistHTFG = true };

            repository
                .GetAsync<MatchGoalRecordModel>(Arg.Any<InstantCheckingCriteria>()).Returns(matchCheckingCentral, matchCheckingSite, matchCheckingSiteSecond);

            // Act
            var actualMatch = await service.CalculateCheckingInfo(new MatchCheckingRequest());

            // Assert
            var expectedMatch = new MatchGoalRecordModel
            {
                IsExistHtFgNg = true,
                IsExistFgNg = true,
                IsExistFG = true,
                IsExistHTFG = true,
                GoalRecord = "123",
                BetStatus = "1234"
            };
            Assert.Equal(JsonConvert.SerializeObject(expectedMatch), JsonConvert.SerializeObject(actualMatch));
        }

        [Fact]
        public async Task PushInstantCalculation_ActionIsUnCalculate_CallUnCalculateOnInstantResourceServiceAndReturnsResultFromRepositoryExecuteAsync()
        {
            // Arrange
            const int errorCode = 100;
            const string errorMsg = "Error Message";
            var request = new InstantCalculationRequest
            {
                Action = ActionType.UnCalculate,
                IsHalfTime = false
            };
            instantResourceService.UnCalculate(Arg.Any<InstantGoalCondition>()).Returns(new List<XmlResource>());
            scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage { ErrorCode = errorCode, ErrorMessage = errorMsg });

            // Act
            var result = await service.PushInstantCalculation(request);

            // Assert
            instantResourceService.Received().UnCalculate(Arg.Any<InstantGoalCondition>());

            Assert.True(result.ErrCode == errorCode && result.ErrMsg == errorMsg);
        }

        [Fact]
        public async Task PushInstantCalculation_IsHalfTime_CallHalftimeOnInstantResourceServiceAndReturnsResultFromRepositoryExecute()
        {
            // Arrange
            const int errorCode = 100;
            const string errorMsg = "Error Message";
            var request = new InstantCalculationRequest
            {
                Action = string.Empty,
                IsHalfTime = true
            };
            instantResourceService.Halftime(Arg.Any<InstantGoalCondition>()).Returns(new List<XmlResource>());
            scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage { ErrorCode = errorCode, ErrorMessage = errorMsg });

            // Act
            var result = await service.PushInstantCalculation(request);

            // Assert
            instantResourceService.Received().Halftime(Arg.Any<InstantGoalCondition>());

            Assert.True(result.ErrCode == errorCode && result.ErrMsg == errorMsg);
        }

        [Fact]
        public async Task PushInstantCalculation_FullTime_CallFullTimeOnInstantResourceServiceAndReturnsResultFromRepositoryExecute()
        {
            // Arrange
            const int errorCode = 100;
            const string errorMsg = "Error Message";
            var request = new InstantCalculationRequest
            {
                Action = ActionType.CalculateFullTime,
                IsHalfTime = false
            };
            instantResourceService.FullTime(Arg.Any<InstantGoalCondition>()).Returns(new List<XmlResource>());
            scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage { ErrorCode = errorCode, ErrorMessage = errorMsg }); ;

            // Act
            var result = await service.PushInstantCalculation(request);

            // Assert
            instantResourceService.Received().FullTime(Arg.Any<InstantGoalCondition>());

            Assert.True(result.ErrCode == errorCode && result.ErrMsg == errorMsg);
        }

        [Fact]
        public async Task PushInstantCalculation_NotExistError_CallUpdateResultAndMatchInfoBeforePush()
        {
            // Arrange
            var request = new InstantCalculationRequest { Action = ActionType.CalculateAll, HomeScore = "0", AwayScore = "0" };
            scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());

            // Act
            var result = await service.PushInstantCalculation(request);

            // Assert
            Received.InOrder(() =>
            {
                repository.Received().ExecuteAsync(Arg.Any<AddAutoResultCriteria>());
                scaleOutSettleService.Received().UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
                repository.Received().ExecuteAsync(Arg.Any<PushInstantCalculationCriteria>());
                repository.Received().ExecuteAsync(Arg.Any<PushInstantCalculationCriteria>());
                repository.Received().ExecuteAsync(Arg.Any<PushInstantCalculationCriteria>());
            });
        }
    }
}