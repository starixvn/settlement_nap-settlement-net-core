using AutoMapper;
using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.InstantCalculate;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;


namespace Settlement.Sportsbook.Soccer.UnitTests.Services.Instant;

public class InstantCalculateServiceFacts
{
    private readonly IDynamicRepository repository;

    private readonly IInstantResourceService instantResourceService;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly InstantCalculateService service;

    public InstantCalculateServiceFacts()
    {
        repository = Substitute.For<IDynamicRepository>();
        var accessor = Substitute.For<IHttpContextAccessor>();
        instantResourceService = Substitute.For<IInstantResourceService>();
        scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
        var logService = Substitute.For<LogService>();

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
        var appSettings = new AppSettingsKey { SiteDbServer = new List<string> { "DB01", "DB02", "DB03" } };
        var option = Options.Create(appSettings);

        service = new InstantCalculateServiceImp(repository, mapper, accessor, instantResourceService, option, scaleOutSettleService, logService);
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
        repository.GetAsync<MatchTicketInfo>(Arg.Any<MatchTicketInfoCriteria>()).Returns(new MatchTicketInfo { });
        repository.GetAsync<MatchDetail>(Arg.Any<GetMatchInfoCriteria>()).Returns(new MatchDetail { });

        // Act
        var result = await service.PushInstantCalculation(request);

        // Assert
        //instantResourceService.Received().UnCalculate(Arg.Any<InstantGoalCondition>());

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
        repository.GetAsync<MatchTicketInfo>(Arg.Any<MatchTicketInfoCriteria>()).Returns(new MatchTicketInfo { });
        repository.GetAsync<MatchDetail>(Arg.Any<GetMatchInfoCriteria>()).Returns(new MatchDetail { });
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
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage { ErrorCode = errorCode, ErrorMessage = errorMsg });

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
        await service.PushInstantCalculation(request);

        // Assert
        Received.InOrder(() =>
        {
            repository.ExecuteAsync(Arg.Any<AddAutoResultCriteria>());
            scaleOutSettleService.UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
            repository.ExecuteAsync(Arg.Any<PushInstantCalculationCriteria>());
            repository.ExecuteAsync(Arg.Any<PushInstantCalculationCriteria>());
            repository.ExecuteAsync(Arg.Any<PushInstantCalculationCriteria>());
        });
    }
}