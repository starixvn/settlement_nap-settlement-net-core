using AutoMapper;
using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.FastMarkets.Constants;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;
using Settlement.FastMarkets.Services;

namespace Settlement.FastMarkets.UnitTests.Services;

public class FastMarketServiceTests
{
    private readonly IFastMarketService service;
    private readonly IDynamicRepository repository;
    private readonly ScaleOutSettleService scaleOutSettleService;
    private readonly MultipleServerFetcherService multipleServerFetcherService;
    private readonly GenerationService generationService;

    public FastMarketServiceTests()
    {
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<FastMarketAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);

        repository = Substitute.For<IDynamicRepository>();
        var logDirectlyService = Substitute.For<LogDirectlyService>();
        scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
        multipleServerFetcherService = Substitute.For<MultipleServerFetcherService>();
        generationService = Substitute.For<GenerationService>();
        var appSettingKey = new AppSettingsKey { SiteDbServer = new List<string> { "01", "02" } };
        var option = Options.Create(appSettingKey);
        service = new FastMarketServiceImp(
            repository,
            mapper,
            multipleServerFetcherService,
            option,
            scaleOutSettleService,
            generationService,
            logDirectlyService);
    }

    [Theory]
    [InlineData(0, 0, 0, TicketStatus.NoTicket)]
    [InlineData(1, 1, 0, TicketStatus.Running)]
    [InlineData(1, 0, 1, TicketStatus.Marked)]
    [InlineData(1, 0, 0, TicketStatus.Calculated)]
    public async Task Query_Always_ReturnsTrue(int ticketCount, int ticketRunning, int ticketMarked,
        int ticketStatus)
    {
        // Arrange
        const int matchId = 100;
        var fastMarketResult = new List<FastMarketResult>
        {
            new()
            {
                BetType = 1,
                Position = 1,
                TicketCount = ticketCount,
                TicketMarked = ticketMarked,
                TicketRunning = ticketRunning
            }
        };
        var ticketsCount = new TicketCounts { GroupId = 1 };
        var result = new IEnumerable<object>[5];

        result[0] = new List<EventCounter> { new() { Position = 1 } };
        result[1] = new List<string> { "a" };
        result[2] = new List<FastMarketResult> { new() { Position = 1, BetType = 1 } };
        result[3] = new List<ResultDetail> { new() { ResourceId = "1" } };

        multipleServerFetcherService.GetFastMarketTicketDetail(Arg.Any<int>())
            .Returns((fastMarketResult, ticketsCount));
        repository
            .FetchMultipleAsync(Arg.Is<GetFastMarketMatchDetailCriteria>(x => x.MatchId == matchId),
                Arg.Any<Type[]>())
            .Returns(result);

        var betTypes = new List<BetType>
        {
            new BetType
            {
                BetTypeId = 1,
                FastMarketResults = fastMarketResult,
            }
        };
        generationService.BetTypesList(Arg.Any<List<FastMarketResult>>(), Arg.Any<string>()).Returns(betTypes);

        // Act
        var viewModel = await service.Query(matchId);

        // Assert
        Assert.True(viewModel.TicketCount.GroupId == 1
                    && viewModel.HandicapValue.Length == 1
                    && viewModel.EventCounters.Count == 1
                    && viewModel.BetTypes.Count == 1);
    }

    [Fact]
    public async Task Calculate_ValidateFailed_StopProcessAndReturn()
    {
        // Arrange
        var query = new SettleRequest();
        var resultValidate = new ResultMessage
        {
            ErrorMessage = "Error",
            ErrorCode = 1
        };
        generationService.QuerySettle(Arg.Any<SettleRequest>()).Returns(new PushFastMarketResultCriteria());
        scaleOutSettleService.ValidateEventAndTicketFastMarket(Arg.Any<EventTicketFastMarketRequest>())
            .Returns(resultValidate);

        // Act
        var result = await service.Calculate(query);

        // Assert
        Assert.False(result.IsSuccessful);
        await scaleOutSettleService.DidNotReceive().UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
    }

    [Fact]
    public async Task Calculate_validatePassed_UpdateAndSettle()
    {
        // Arrange
        var query = new SettleRequest();
        generationService.QuerySettle(Arg.Any<SettleRequest>()).Returns(new PushFastMarketResultCriteria());
        scaleOutSettleService.ValidateEventAndTicketFastMarket(Arg.Any<EventTicketFastMarketRequest>())
            .Returns(new ResultMessage());

        // Act
        await service.Calculate(query);

        // Assert
        await scaleOutSettleService.Received().UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
        repository.Received(2).Execute(Arg.Any<PushFastMarketResultCriteria>());
    }

    [Fact]
    public async Task GetLatestResult_Always_ReturnCorrectly()
    {
        const int matchId = 100;
        var result = new IEnumerable<object>[4];

        result[0] = new List<EventCounter> { new() };
        result[1] = new List<string> { "a" };
        result[2] = new List<FastMarketResult> { new() { Position = 1, BetType = 2 } };
        result[3] = new List<ResultDetail> { new() };

        repository
            .FetchMultipleAsync(Arg.Is<GetFastMarketMatchDetailCriteria>(x => x.MatchId == matchId),
                Arg.Any<Type[]>())
            .Returns(result);

        var actual = await service.GetLatestResult(new GetLatestResultRequest { MatchId = matchId });

        Assert.True(actual[0].Position == 1 && actual[0].BetType == 2);
    }

    [Fact]
    public async Task GetTimeMachineResult_Always_ReturnCorrectly()
    {
        const int matchId = 100;
        var listTimeMachine = new List<TimeMachineResult>
        {
            new()
            {
                Position = 1
            }
        };
        repository.FetchAsync<TimeMachineResult>(
            Arg.Is<GetTimeMachineResultCriteria>(item => item.MatchId == matchId)).Returns(listTimeMachine);

        var actual = await service.GetTimeMachineResult(new GetTimeMachineResultRequest { MatchId = matchId });

        Assert.Equal(1, actual[0].Position);
    }
}