using Settlement.Log.Models.BetTypeElement;
using Settlement.Log.Models.EventCounterElement;
using Settlement.Log.Services;

namespace Settlement.Log.UnitTests.Services;

public class RemarkNodeServiceTests
{
    private readonly PositionService positionService;
    private readonly RemarkNodeService service;

    public RemarkNodeServiceTests()
    {
        positionService = Substitute.For<PositionService>();
        service = new RemarkNodeServiceImp(positionService);
    }

    [Fact]
    public void RemarkByNode_EmptyItem_ReturnsEmpty()
    {
        // Act
        var remark = service.BetTypeLogs(new List<BetTypeElement>());

        // Assert
        Assert.Empty(remark);
    }

    [Fact]
    public void EventCounter_InputEmptyContent_ReturnsEmpty()
    {
        // Act
        var eventCounterLog = service.EventCounterLogs(new List<ItemElement>());

        // Assert
        Assert.Equal("<br/>", eventCounterLog);
    }

    [Fact]
    public void EventCounter_InputValidContent_ReturnsValidLog()
    {
        // Arrange
        var eventCounter = new List<ItemElement>
        {
            new()
            {
                Position = 1,
                Result = "80000260",
            },
            new()
            {
                Position = 2,
                Result = "00000070",
            },
            new()
            {
                Position = 3,
                Result = "00000000",
            }
        };

        // Act
        var eventCounterLog = service.EventCounterLogs(eventCounter);

        // Assert
        const string expectedLog = "<br/>Event Counter: 1:6G,2C,8P; 2:7G; 3:N<br/>";
        Assert.Equal(expectedLog, eventCounterLog);
    }

    [Fact]
    public void RemarkByNode_HasNoResult_ReturnsContainsBetTypeIdAndPositionAndResultFromPositionServicePositionName()
    {
        // Arrange
        const int betTypeId = 12;
        const string position = "Position";
        var bettypes = new List<BetTypeElement>
        {
            new()
            {
                Id = betTypeId,
                Item = new BetTypeItemElement[] { new() { Position = position } }
            }
        };
        positionService.PositionName(betTypeId, Arg.Any<BetTypeItemElement>()).Returns(string.Empty);

        // Act
        var remark = service.BetTypeLogs(bettypes);

        // Assert
        var expectedRemark = $"ResourceId: {betTypeId} | Result: <br/>";
        Assert.Equal(expectedRemark, remark);
    }

    [Fact]
    public void RemarkByNode_XMLContentHasBetTypeNodeAndItemElementHasResult_ReturnsContainsBetTypeIdAndPositionAndResultFromPositionServicePositionName()
    {
        // Arrange
        const int betTypeId = 12;
        const string position = "Position";
        const string result = "Result";
        const string positionAndResult = "Position And Result";
        var bettypes = new List<BetTypeElement>
        {
            new()
            {
                Id = betTypeId,
                Item = new BetTypeItemElement[] { new() { Position = position, Result = result } }
            }
        };

        positionService.PositionName(Arg.Any<int>(), Arg.Any<BetTypeItemElement>()).Returns(positionAndResult);

        // Act
        var remark = service.BetTypeLogs(bettypes);

        // Assert
        var expectedRemark = $"ResourceId: {betTypeId} | Result: {positionAndResult}<br/>";
        Assert.Equal(expectedRemark, remark);
    }
}