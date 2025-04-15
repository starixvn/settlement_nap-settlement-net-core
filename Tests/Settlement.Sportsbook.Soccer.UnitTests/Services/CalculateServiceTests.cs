using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using MassTransit;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.GetMatch;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services;

public class CalculateServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly ICreateCriteriaService createCriteriaService;

    private readonly CalculateServiceImp service;

    private readonly LogService logService;
    private readonly XmlConvertService xmlConvertService;
    private readonly INapSession currentSession;
    private readonly IHttpContextAccessor httpContext;
    private readonly IPublishEndpoint publishEndpoint;

    public CalculateServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        createCriteriaService = Substitute.For<ICreateCriteriaService>();
        scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
        xmlConvertService = Substitute.For<XmlConvertService>();
        currentSession = Substitute.For<INapSession>();
        httpContext = Substitute.For<IHttpContextAccessor>();
        publishEndpoint = Substitute.For<IPublishEndpoint>();

        logService = Substitute.For<LogService>();
        var matchService = Substitute.For<IMatchService>();
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SoccerAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        var appSettings = new AppSettingsKey { SiteDbServer = ["DB01", "DB02", "DB03"] };
        var appSettingsOptions = Options.Create(appSettings);
        service = new CalculateServiceImp(
            mapper, repository, appSettingsOptions, createCriteriaService, scaleOutSettleService, logService, matchService, publishEndpoint, currentSession, httpContext, xmlConvertService);
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
        createCriteriaService.CreateCalculateLogCriteria(Arg.Any<SettleRequest>()).Returns(new InsertLogCriteria());
        await logService.WriteLog(Arg.Any<int>(), Arg.Any<string>());
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
            ActionName = ActionType.CalculateAll
        };
        var criteria = new CalculateCriteria
        {
            Action = ActionType.CalculateAll
        };
        createCriteriaService.CreateCalculateCriteria(Arg.Any<SettleRequest>()).Returns(criteria);
        createCriteriaService.CreateCalculateLogCriteria(Arg.Any<SettleRequest>()).Returns(new InsertLogCriteria());
        await logService.WriteLog(Arg.Any<int>(), Arg.Any<string>());

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
        createCriteriaService.CreateCalculateLogCriteria(Arg.Any<SettleRequest>()).Returns(new InsertLogCriteria());
        await logService.WriteLog(Arg.Any<int>(), Arg.Any<string>());
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
            MatchId = 12345
        };

        var actual = await service.CheckStatus(request);

        Assert.Equal(result, actual.IsSuccessful);
    }

    [Theory]
    [InlineData(0, "", true)]
    [InlineData(1, "Error", false)]
    public async Task UncalculateFT_Always_ReturnCorrectResult(int errorCode, string errorMsg, bool result)
    {
        var query = new UncalculateFtRequest();
        var criteria = new CalculateCriteria
        {
            Action = ActionType.UnCalculateFullTime
        };
        createCriteriaService.CreateUnCalculateFtCriteria(Arg.Any<UncalculateFtRequest>()).Returns(criteria);
        createCriteriaService.CreateUnCalculateFtLogCriteria(Arg.Any<UncalculateFtRequest>()).Returns(new InsertLogCriteria());
        await logService.WriteLog(Arg.Any<int>(), Arg.Any<string>());
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage { ErrorCode = errorCode, ErrorMessage = errorMsg });

        var actual = await service.UncalculateFt(query);

        Assert.Equal(result, actual.IsSuccessful);
    }

    [Fact]
    public async Task UncalculateFT_ValidatePassed_UpdateMatchAndExecuteAllDb()
    {
        var query = new UncalculateFtRequest();
        var criteria = new CalculateCriteria
        {
            Action = ActionType.UnCalculateFullTime,
            MatchId = 1
        };
        createCriteriaService.CreateUnCalculateFtCriteria(Arg.Any<UncalculateFtRequest>()).Returns(criteria);
        createCriteriaService.CreateUnCalculateFtLogCriteria(Arg.Any<UncalculateFtRequest>()).Returns(new InsertLogCriteria());
        await logService.WriteLog(Arg.Any<int>(), Arg.Any<string>());
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());

        await service.UncalculateFt(query);

        await scaleOutSettleService.Received().UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
        await repository.Received(3).ExecuteAsync(Arg.Any<CalculateCriteria>());
    }

    [Fact]
    public async Task UncalculateFT_ApplyHedgeMatch_ExecuteTwice()
    {
        var query = new UncalculateFtRequest
        {
            IsApplyHedging = true,
            HedgeMatchId = 123
        };
        var criteria = new CalculateCriteria
        {
            Action = ActionType.UnCalculateFullTime,
            MatchId = 1
        };
        createCriteriaService.CreateUnCalculateFtCriteria(Arg.Any<UncalculateFtRequest>()).Returns(criteria);
        createCriteriaService.CreateUnCalculateFtLogCriteria(Arg.Any<UncalculateFtRequest>()).Returns(new InsertLogCriteria());
        await logService.WriteLog(Arg.Any<int>(), Arg.Any<string>());
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());

        await service.UncalculateFt(query);

        await scaleOutSettleService.Received(2).UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
        await repository.Received(6).ExecuteAsync(Arg.Any<CalculateCriteria>());
    }
    [Theory]
    [InlineData(0, "", true)]
    [InlineData(1, "Error", false)]
    public async Task SaveScore_Always_ReturnCorrectResult(int errorCode, string errorMsg, bool result)
    {
        var query = new SaveScoreRequest
        {
            MatchId = 12345,
            ResultDetails = new List<ResultDetail>
            {
                new ResultDetail { ResourceId = ResourceType.Final, HomeValue = "2", AwayValue = "1" }
            }
        };
        var criteria = new SaveScoreCriteria
        {
            ErrCode = errorCode,
            ErrMsg = errorMsg
        };
        createCriteriaService.CreateSaveScoreCriteria(Arg.Any<SaveScoreRequest>()).Returns(criteria);
        await repository.ExecuteAsync(Arg.Any<SaveScoreCriteria>());

        var actual = await service.SaveScore(query);

        Assert.Equal(result, actual.IsSuccessful);
    }

    [Fact]
    public async Task SaveScore_ValidRequest_LogsAction()
    {
        var query = new SaveScoreRequest
        {
            MatchId = 12345,
            ResultDetails = new List<ResultDetail>
            {
                new ResultDetail { ResourceId = ResourceType.Final, HomeValue = "2", AwayValue = "1" }
            }
        };
        var criteria = new SaveScoreCriteria
        {
            ErrCode = 0
        };
        createCriteriaService.CreateSaveScoreCriteria(Arg.Any<SaveScoreRequest>()).Returns(criteria);
        await repository.ExecuteAsync(Arg.Any<SaveScoreCriteria>());

        await service.SaveScore(query);

        await logService.Received().ActionLog(Arg.Any<int>(), Arg.Is<string>(r => r == "FT(2-1)"), Arg.Any<int>());
    }
}