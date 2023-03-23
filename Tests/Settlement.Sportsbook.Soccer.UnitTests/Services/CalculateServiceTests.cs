using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services;

public class CalculateServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly ICreateCriteriaService createCriteriaService;

    private readonly ICalculateService service;

    private readonly LogDirectlyService logDirectlyService;

    public CalculateServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        createCriteriaService = Substitute.For<ICreateCriteriaService>();
        scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
        logDirectlyService = Substitute.For<LogDirectlyService>();
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SoccerAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        var appSettings = new AppSettingsKey { SiteDbServer = new List<string> { "DB01", "DB02", "DB03" } };
        var appSettingsOptions = Options.Create(appSettings);
        service = new CalculateServiceImp(mapper, repository, appSettingsOptions, createCriteriaService, scaleOutSettleService, logDirectlyService);
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
        var criteria = new CalculateCriteria
        {
            Action = ActionType.CalculateAll
        };
        createCriteriaService.CreateCalculateCriteria(Arg.Any<SettleRequest>()).Returns(criteria);
        logDirectlyService.WriteLog(Arg.Any<int>(), Arg.Any<string>());
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage { ErrorCode = errorCode, ErrorMessage = errorMsg });

        var actual = await service.Calculate(query);

        Assert.Equal(result, actual.IsSuccessful);
    }

    [Fact]
    public async Task Settle_Always_UpdateMatchAndChildMatch()
    {
        var query = new SettleRequest
        {
            GoalRecord = "AH",
            ActionName = ActionType.CalculateAll,
        };
        var criteria = new CalculateCriteria
        {
            Action = ActionType.CalculateAll
        };
        createCriteriaService.CreateCalculateCriteria(Arg.Any<SettleRequest>()).Returns(criteria);
        logDirectlyService.WriteLog(Arg.Any<int>(), Arg.Any<string>());

        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());

        await service.Calculate(query);

        await scaleOutSettleService.Received()
            .UpdateUnderSettlementFlag(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<string>());
        await scaleOutSettleService.Received().UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
        await scaleOutSettleService.Received().UpdateAutoRefundChildMatch(Arg.Any<RefundChildMatchRequest>());
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
        var criteria = new CalculateCriteria
        {
            Action = ActionType.CalculateAll
        };
        createCriteriaService.CreateCalculateCriteria(Arg.Any<SettleRequest>()).Returns(criteria);
        logDirectlyService.WriteLog(Arg.Any<int>(), Arg.Any<string>());
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());
        await repository.ExecuteAsync(Arg.Any<CalculateCriteria>());

        await service.Calculate(query);

        await repository.Received(6).ExecuteAsync(Arg.Any<CalculateCriteria>());
    }

    [Theory]
    [InlineData(0, "", true)]
    [InlineData(1, "Error", false)]
    public async Task CheckStatus_Always_ReturnCorrectResult(int errorCode, string errorMsg, bool result)
    {
        await repository.ExecuteAsync(Arg.Do<CheckStatusCriteria>(x =>
        {
            x.ErrCode = errorCode;
            x.ErrMsg = errorMsg;
        }));
        var request = new CheckStatusRequest
        {
            MatchId = 12345,
        };

        var actual = await service.CheckStatus(request);

        Assert.Equal(result, actual.IsSuccessful);
    }
}