using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Services;

namespace Settlement.FastMarkets.UnitTests.Services;

public class FastMarketBetTypeServiceTests
{
    private readonly IFastMarketBetTypeService service;
    private readonly List<FastMarketResult> fastMarkets;

    public FastMarketBetTypeServiceTests()
    {
        var resultLabelService = new ResultLabelServiceImp();
        service = new FastMarketBetTypeServiceImp(null, resultLabelService);
        fastMarkets = new List<FastMarketResult>();
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
        Assert.Equal(betTypeId, betTypes.First().BetTypeId);
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
        Assert.Equal(betTypeId, betTypes.First().BetTypeId);
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
        Assert.Equal(2, betTypes.First().FastMarketResults.Count);
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
        Assert.Equal(betType1, betTypes.First().BetTypeId);
    }
}