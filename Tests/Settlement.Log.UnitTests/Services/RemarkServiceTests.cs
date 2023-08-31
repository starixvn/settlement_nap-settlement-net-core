using Settlement.Log.Models.BetTypeElement;
using Settlement.Log.Models.EventCounterElement;
using Settlement.Log.Services;

namespace Settlement.Log.UnitTests.Services;

public class RemarkServiceTests
{
    private readonly RemarkNodeService remarkNodeService;
    private readonly RemarkService service;

    public RemarkServiceTests()
    {
        remarkNodeService = Substitute.For<RemarkNodeService>();
        service = new RemarkServiceImp(remarkNodeService);
    }

    [Theory]
    [InlineData(165)]
    [InlineData(166)]
    [InlineData(167)]
    public void IsFastMarketAction_FromActionIdIsFastMarketActionId_ReturnsTrue(int actionId)
    {
        // Act
        var isFastMarketAction = service.IsFastMarketAction(actionId);

        // Assert
        Assert.True(isFastMarketAction);
    }

    [Fact]
    public void IsFastMarketAction_FromActionIdIsNotFastMarketActionId_ReturnsFalse()
    {
        // Arrange
        const int actionId = 100;

        // Act
        var isFastMarketAction = service.IsFastMarketAction(actionId);

        // Assert
        Assert.False(isFastMarketAction);
    }

    [Fact]
    public void RemarkValue_FromValueNotContainsBrokenBar_ReturnsEmpty()
    {
        // Act
        var remarkValue = service.RemarkValue(new List<BetTypeElement>(), new List<ItemElement>());

        // Assert
        Assert.Empty(remarkValue);
    }

    [Fact]
    public void RemarkValue_FromValueContainsBrokenBar_ReturnsFromRemarkNodeServiceWithSecondElementAndFirstElement()
    {
        // Arrange
        const string eventCounterLog = "EventCounter";
        const string bettypeLogs = "Bettype log";
        remarkNodeService.BetTypeLogs(Arg.Any<List<BetTypeElement>>()).Returns(bettypeLogs);
        remarkNodeService.EventCounterLogs(Arg.Any<IEnumerable<ItemElement>>()).Returns(eventCounterLog);
        // Act
        var remarkValue = service.RemarkValue(new List<BetTypeElement>(), new List<ItemElement>());

        // Assert
        const string expectedRemark = eventCounterLog + bettypeLogs;
        Assert.Equal(expectedRemark, remarkValue);
    }
}