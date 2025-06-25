using AutoMapper;
using Fanex.NAP.Client;
using Microsoft.AspNetCore.Http;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Models.BetTypeModels;
using Settlement.FastMarkets.Models.EventCounterModels;
using Settlement.FastMarkets.Requests;
using Settlement.FastMarkets.Services;

namespace Settlement.FastMarkets.UnitTests.Services;

public class GenerationServiceTests
{
    private readonly IFastMarketResultService fastMarketResultService;

    private readonly IEventCounterService eventCounterService;

    private readonly GenerationService service;

    private readonly List<FastMarketResult> fastMarkets;

    public GenerationServiceTests()
    {
        fastMarkets = [];

        fastMarketResultService = Substitute.For<IFastMarketResultService>();
        eventCounterService = Substitute.For<IEventCounterService>();
        var resultLabelService = Substitute.For<ResultLabelService>();
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<FastMarketAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        var currentSession = Substitute.For<INapSession>();
        var accessor = Substitute.For<IHttpContextAccessor>();
        var context = new DefaultHttpContext
        {
            Connection =
            {
                RemoteIpAddress = new System.Net.IPAddress(1)
            }
        };
        accessor.HttpContext = context;
        service = new GenerationServiceImp(fastMarketResultService, eventCounterService, mapper, currentSession,
            accessor, null, resultLabelService);
    }

    [Fact]
    public async Task QuerySettle_Always_CallRelatedMethod()
    {
        fastMarketResultService.Result(Arg.Any<List<BetType>>(), Arg.Any<string>())
            .Returns(_ => new XMLResult<BetTypeElement>() { Result = "test", OriginalItems = [] });

        eventCounterService.Result(Arg.Any<SettleRequest>())
            .Returns(_ => new XMLResult<EventCounterElement>() { Result = "testEventCounter" });

        fastMarketResultService.OldResults(Arg.Any<List<BetType>>(), Arg.Any<int>())
            .Returns(_ => "TestOldResult");

        var result = await service.QuerySettle(new SettleRequest());

        Assert.Equal("test", result.Results);
        Assert.Equal("testEventCounter", result.EventCounters);
        Assert.Equal("TestOldResult", result.OldResults);
    }

    [Fact]
    public void BetTypesList_FromFastMarketsIsEmptyList_ReturnsEmptyList()
    {
        // Act
        var betTypes = service.BetTypesList(fastMarkets, string.Empty);

        // Assert
        Assert.Empty(betTypes);
    }

    [Fact]
    public void BetTypesList_FromFastMarketsHasOneResult_ReturnsOneBetType()
    {
        // Arrange
        fastMarkets.Add(new FastMarketResult { BetType = 221 });

        // Act
        var betTypes = service.BetTypesList(fastMarkets, string.Empty);

        // Assert
        Assert.Single(betTypes);
    }

    [Fact]
    public void BetTypesList_FromFastMarketsHasOneResult_ReturnsOneBetTypeHasSameBetTypeId()
    {
        // Arrange
        const int betTypeId = 222;
        fastMarkets.Add(new FastMarketResult { BetType = betTypeId });

        // Act
        var betTypes = service.BetTypesList(fastMarkets, string.Empty);

        // Assert
        Assert.Equal(betTypeId, betTypes[0].BetTypeId);
    }

    [Fact]
    public void BetTypesList_FromFastMarketsTwoResultsHaveSameBetTypeId_ReturnsOneBetType()
    {
        // Arrange
        const int betTypeId = 222;
        fastMarkets.Add(new FastMarketResult { BetType = betTypeId });
        fastMarkets.Add(new FastMarketResult { BetType = betTypeId });

        // Act
        var betTypes = service.BetTypesList(fastMarkets, string.Empty);

        // Assert
        Assert.Single(betTypes);
    }

    [Fact]
    public void BetTypesList_FromFastMarketsTwoResultsHaveSameBetTypeId_ReturnsOneBetTypeHasSameBetTypeId()
    {
        // Arrange
        const int betTypeId = 222;
        fastMarkets.Add(new FastMarketResult { BetType = betTypeId });
        fastMarkets.Add(new FastMarketResult { BetType = betTypeId });

        // Act
        var betTypes = service.BetTypesList(fastMarkets, string.Empty);

        // Assert
        Assert.Equal(betTypeId, betTypes[0].BetTypeId);
    }

    [Fact]
    public void BetTypesList_FromFastMarketsTwoResultsHaveSameBetTypeId_ReturnsOneBetTypeHasTwoFastMarketsResults()
    {
        // Arrange
        const int betTypeId = 222;
        fastMarkets.Add(new FastMarketResult { BetType = betTypeId });
        fastMarkets.Add(new FastMarketResult { BetType = betTypeId });

        // Act
        var betTypes = service.BetTypesList(fastMarkets, string.Empty);

        // Assert
        Assert.Equal(2, betTypes[0].FastMarketResults.Count);
    }

    [Fact]
    public void BetTypesList_FromFastMarketsTwoResultsHaveDifferenceBetTypeId_ReturnsTwoBetTypes()
    {
        // Arrange
        fastMarkets.Add(new FastMarketResult { BetType = 221 });
        fastMarkets.Add(new FastMarketResult { BetType = 225 });

        // Act
        var betTypes = service.BetTypesList(fastMarkets, string.Empty);

        // Assert
        Assert.Equal(2, betTypes.Count);
    }

    [Fact]
    public void BetTypesList_FromFastMarketsTwoResultsHaveUnsortedDifferenceBetTypeId_ReturnsFirstElementIsLessValue()
    {
        // Arrange
        const int betType1 = 221;
        const int betType2 = 222;
        fastMarkets.Add(new FastMarketResult { BetType = betType1 });
        fastMarkets.Add(new FastMarketResult { BetType = betType2 });

        // Act
        var betTypes = service.BetTypesList(fastMarkets, string.Empty);

        // Assert
        Assert.Equal(betType1, betTypes[0].BetTypeId);
    }
}