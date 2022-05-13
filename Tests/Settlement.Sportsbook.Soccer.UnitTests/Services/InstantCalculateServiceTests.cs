using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Constants;
using Xunit;

namespace Settlement.Sportsbook.Soccer.UnitFacts.Services
{
    public class InstantCalculateServiceFacts
    {
        private readonly IDynamicRepository repository;

        private readonly INapSession currentSession;

        private readonly IHttpContextAccessor accessor;

        private readonly XmlConvertService xmlConvertService;

        private readonly IInstantResourceService instantResourceService;

        private readonly IInstantCalculateService service;

        public InstantCalculateServiceFacts()
        {
            repository = Substitute.For<IDynamicRepository>();
            currentSession = Substitute.For<INapSession>();
            accessor = Substitute.For<IHttpContextAccessor>();
            xmlConvertService = Substitute.For<XmlConvertService>();
            instantResourceService = Substitute.For<IInstantResourceService>();
            var context = new DefaultHttpContext();
            context.Connection.RemoteIpAddress = new System.Net.IPAddress(1);
            accessor.HttpContext = context;
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<SoccerAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            service = new InstantCalculateServiceImp(repository, currentSession, mapper, accessor, xmlConvertService, instantResourceService);
        }

        [Fact]
        public async Task CalculateCheckingInfo_Always_ReturnsMatchInfoFromRepositoryGet()
        {
            // Arrange
            const int errorCode = 100;
            const string errorMsg = "Error Message";
            repository
                .GetAsync<MatchGoalRecordModel>(Arg.Do<InstantCheckingCriteria>(x =>
                {
                    x.ErrCode = errorCode;
                    x.ErrMsg = errorMsg;
                })).Returns(new MatchGoalRecordModel());

            // Act
            var actualMatch = await service.CalculateCheckingInfo(new MatchCheckingRequest());

            // Assert
            var expectedMatch = new MatchGoalRecordModel
            {
                ErrCode = errorCode,
                ErrMsg = errorMsg
            };
            Assert.Equal(JsonConvert.SerializeObject(expectedMatch), JsonConvert.SerializeObject(actualMatch));
        }

        [Fact]
        public async Task PushInstantCalculation_ActionIsUncalculate_CallUnCalculateOnInstantResourceServiceAndReturnsResultFromRepositoryExecuteAsync()
        {
            // Arrange
            const int errorCode = 100;
            const string errorMsg = "Error Message";
            var request = new InstantCalculationRequest
            {
                Action = ActionType.Uncalculate,
                IsHalfTime = false
            };
            instantResourceService.UnCalculate(Arg.Any<InstantGoalCondition>()).Returns(new List<XmlResource>());
            await repository.ExecuteAsync(Arg.Do<PushInstantCalculationCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            }));

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
            await repository.ExecuteAsync(Arg.Do<PushInstantCalculationCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            }));

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
            await repository.ExecuteAsync(Arg.Do<PushInstantCalculationCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            }));

            // Act
            var result = await service.PushInstantCalculation(request);

            // Assert
            instantResourceService.Received().FullTime(Arg.Any<InstantGoalCondition>());

            Assert.True(result.ErrCode == errorCode && result.ErrMsg == errorMsg);
        }
    }
}