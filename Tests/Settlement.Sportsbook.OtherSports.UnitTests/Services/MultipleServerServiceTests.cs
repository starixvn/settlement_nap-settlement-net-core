using AutoMapper;
using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Settlement.Constants;
using Settlement.Criteria;
using Settlement.Models;
using Settlement.Services;
using Settlement.Sportsbook.OtherSports.Criteria;
using Settlement.Sportsbook.OtherSports.Models;
using Settlement.Sportsbook.OtherSports.Requests;

namespace Settlement.Sportsbook.OtherSports.UnitTests.Services;

public class MultipleServerServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly MergeDataService mergeDataService;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly MultipleServerService service;

    private readonly LogService logService;

    public MultipleServerServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        mergeDataService = Substitute.For<MergeDataService>();
        scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
        logService = Substitute.For<LogService>();
        var appSettingsKey = new AppSettingsKey { SiteDbServer = ["01", "02"] };
        var options = Options.Create(appSettingsKey);
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<OtherSportsAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        service = new MultipleServerServiceImp(repository, options, mergeDataService, scaleOutSettleService, logService, mapper);
    }

    [Fact]
    public async Task GetMatchInfo_MatchDetailNotNull_CallAllRelatedMethod()
    {
        var fakeData = new IEnumerable<object>[2];
        fakeData[0] = new List<MatchDetail> { new() };
        fakeData[1] = new List<TicketCounts> { new() };
        repository.FetchMultipleAsync(Arg.Any<GetSportsbookMatchDetailCriteria>(), Arg.Any<Type[]>())
            .Returns(fakeData);
        repository.FetchMultipleAsync(Arg.Any<GetTicketInfoCriteria>(), Arg.Any<Type[]>()).Returns(fakeData);

        await service.GetMatchInfo(new GetMatchRequest());

        await repository.Received(2).FetchMultipleAsync(Arg.Any<GetTicketInfoCriteria>(), Arg.Any<Type[]>());
        mergeDataService.Received().MergeMatchDetail(Arg.Any<MatchDetail>(), Arg.Any<List<TicketCounts>>());
        mergeDataService.Received().GroupTicketCount(Arg.Any<List<TicketCounts>>());
    }

    [Fact]
    public async Task Calculate_ValidateFailed_StopAndReturn()
    {
        var failedResult = new ResultMessage
        {
            ErrorCode = 1
        };
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(failedResult);

        var result = await service.Calculate(new CalculateCriteria { Action = ActionType.CalculateAll, MatchId = 100, AdminId = 10 }, new ScoreSetModel());

        Assert.Equal(failedResult.ErrorCode, result.ErrCode);
        await scaleOutSettleService.DidNotReceive().UpdateUnderSettlementFlag(100, 10, ActionType.CalculateAll);
    }

    [Theory]
    [InlineData(ActionType.CalculateFullTime, 1, false)]
    [InlineData(ActionType.CalculateFullTime, 0, true)]
    [InlineData(ActionType.CalculateAll, 0, false)]
    public async Task Calculate_ValidatePassed_CheckHTSettledAndSettle(string action, int runningBetType, bool expected)
    {
        var ticketHt = new TicketCounts
        {
            BetRunningCount = runningBetType,
            GroupId = 1
        };
        var fakeData = new IEnumerable<object>[2];
        fakeData[0] = new List<MatchDetail> { new() };
        fakeData[1] = new List<TicketCounts> { new() };
        repository.FetchMultipleAsync(Arg.Any<GetTicketInfoCriteria>(), Arg.Any<Type[]>())
            .Returns(fakeData);
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());
        mergeDataService.MergeTicketCounts(Arg.Any<List<List<TicketCounts>>>())
            .Returns([ticketHt]);

        var result = await service.Calculate(new CalculateCriteria { Action = action, MatchId = 100, AdminId = 10, IsReSettledTickets = false, IsHedgeMatch = true }, new ScoreSetModel());

        await scaleOutSettleService.Received().UpdateUnderSettlementFlag(100, 10, action);
        await scaleOutSettleService.Received().UpdateMatchInfo(Arg.Is<UpdateMatchInfoRequest>(item => item.IsHtTicketSettled == expected));
        await repository.Received(2).ExecuteAsync(Arg.Any<CalculateCriteria>());
        await repository.DidNotReceive().ExecuteAsync(Arg.Any<InsertLogCriteria>());
        Assert.Null(result.ErrMsg);
    }

    [Fact]
    public async Task Calculate_ValidatePassedAndIsResettle_InsertLog()
    {
        var fakeData = new IEnumerable<object>[2];
        fakeData[0] = new List<MatchDetail> { new() };
        fakeData[1] = new List<TicketCounts> { new() };
        repository.FetchMultipleAsync(Arg.Any<GetTicketInfoCriteria>(), Arg.Any<Type[]>())
            .Returns(fakeData);
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());
        mergeDataService.MergeTicketCounts(Arg.Any<List<List<TicketCounts>>>())
            .Returns([]);

        await service.Calculate(new CalculateCriteria { IsReSettledTickets = true, Action = "CAL" }, new ScoreSetModel());

        await logService.Received().WriteLog(Arg.Any<InsertLogCriteria>());
    }
}