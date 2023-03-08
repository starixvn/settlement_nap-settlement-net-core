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
        // Arrange
        var value = string.Empty;

        // Act
        var remarkValue = service.RemarkValue(value);

        // Assert
        Assert.Empty(remarkValue);
    }

    [Fact]
    public void RemarkValue_FromValueContainsBrokenBar_ReturnsFromRemarkNodeServiceWithSecondElementAndFirstElement()
    {
        // Arrange
        const string first = "First";
        const string second = "Second";
        const string remarkByNode = "Remark By Node";
        const string value = $"{first}|{second}|";
        remarkNodeService.BetTypes(second, string.Empty).Returns(remarkByNode);

        // Act
        var remarkValue = service.RemarkValue(value);

        // Assert
        const string expectedRemark = remarkByNode + first;
        Assert.Equal(expectedRemark, remarkValue);
    }
}