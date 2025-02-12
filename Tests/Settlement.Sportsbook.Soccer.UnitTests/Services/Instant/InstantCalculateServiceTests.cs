using AutoMapper;
using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.InstantCalculate;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.Instant;

public class InstantCalculateServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly InstantResourceService instantResourceService;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly InstantCalculateService service;

    private readonly PushInstantCalculationService pushInstantCalculationService;

    private readonly IResourceService resourceService;

    public InstantCalculateServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        instantResourceService = Substitute.For<InstantResourceService>();
        scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
        pushInstantCalculationService = Substitute.For<PushInstantCalculationService>();
        resourceService = Substitute.For<IResourceService>();

        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SoccerAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        var appSettings = new AppSettingsKey { SiteDbServer = ["DB01", "DB02", "DB03"] };
        var option = Options.Create(appSettings);

        service = new InstantCalculateServiceImp(repository, mapper, instantResourceService, option, scaleOutSettleService, pushInstantCalculationService, resourceService);
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
        instantResourceService.UnCalculate(Arg.Any<InstantGoalCondition>()).Returns([]);
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage { ErrorCode = errorCode, ErrorMessage = errorMsg });
        repository.GetAsync<MatchTicketInfo>(Arg.Any<MatchTicketInfoCriteria>()).Returns(new MatchTicketInfo());
        repository.GetAsync<MatchDetail>(Arg.Any<GetMatchInfoCriteria>()).Returns(new MatchDetail());

        // Act
        var result = await service.PushInstantCalculation(request);

        // Assert

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
            IsHalfTime = true,
            HomeScore = "1",
            AwayScore = "1",
            GoalRecord = "AH"
        };
        instantResourceService.Halftime(Arg.Any<InstantGoalCondition>()).Returns([]);
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage { ErrorCode = errorCode, ErrorMessage = errorMsg });
        repository.GetAsync<MatchTicketInfo>(Arg.Any<MatchTicketInfoCriteria>()).Returns(new MatchTicketInfo { GoalRecord = "AH" });
        repository.GetAsync<MatchDetail>(Arg.Any<GetMatchInfoCriteria>()).Returns(new MatchDetail { GoalRecord = "AH" });

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
        instantResourceService.FullTime(Arg.Any<InstantGoalCondition>()).Returns([]);
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage { ErrorCode = errorCode, ErrorMessage = errorMsg });
        repository.GetAsync<MatchTicketInfo>(Arg.Any<MatchTicketInfoCriteria>()).Returns(new MatchTicketInfo { GoalRecord = "AH" });
        repository.GetAsync<MatchDetail>(Arg.Any<GetMatchInfoCriteria>()).Returns(new MatchDetail { GoalRecord = "AH" });

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
        repository.GetAsync<MatchTicketInfo>(Arg.Any<MatchTicketInfoCriteria>()).Returns(new MatchTicketInfo { GoalRecord = "AH" });
        repository.GetAsync<MatchDetail>(Arg.Any<GetMatchInfoCriteria>()).Returns(new MatchDetail { GoalRecord = "AH" });

        // Act
        await service.PushInstantCalculation(request);

        // Assert
        Received.InOrder(() =>
        {
            repository.ExecuteAsync(Arg.Any<AddAutoResultCriteria>());
            scaleOutSettleService.UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
            pushInstantCalculationService.Execute(Arg.Any<PushInstantCalculationCriteria>());
        });
    }
}