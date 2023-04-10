using Settlement.Log.Models.BetTypeElement;
using Settlement.Log.Services;

namespace Settlement.Log.UnitTests.Services;

public class RemarkNodeServiceTests
{
    private readonly PositionService positionService;
    private readonly RemarkNodeService service;

    public RemarkNodeServiceTests()
    {
        positionService = Substitute.For<PositionService>();
        var xmlConvertService = new XmlConvertServiceImp();
        service = new RemarkNodeServiceImp(positionService, xmlConvertService);
    }

    [Fact]
    public void RemarkByNode_XMLContentHasNoBetTypeNode_ReturnsEmpty()
    {
        // Arrange
        const string content = "<BetTypes />";

        // Act
        var remark = service.BetTypes(content, string.Empty);

        // Assert
        Assert.Empty(remark);
    }

    [Fact]
    public void EventCounter_InputEmptyContent_ReturnsEmpty()
    {
        // Arrange
        var content = string.Empty;

        // Act
        var eventCounterLog = service.EventCounter(content);

        // Assert
        Assert.Empty(eventCounterLog);
    }

    [Fact]
    public void EventCounter_InputValidContent_ReturnsValidLog()
    {
        // Arrange
        const string content = "<EventCounters><Item Position=\"1\" Result=\"80000260\"/><Item Position=\"2\" Result=\"00000070\"/><Item Position=\"3\" Result=\"00000000\"/></EventCounters>";

        // Act
        var eventCounterLog = service.EventCounter(content);

        // Assert
        const string expectedLog = "Event Counter: 1:6G,2C,8P; 2:7G; 3:N<br/>";
        Assert.Equal(expectedLog, eventCounterLog);
    }

    [Fact]
    public void RemarkByNode_XMLContentHasBetTypeNodeAndItemElementHasNoResult_ReturnsContainsBetTypeIdAndPositionAndResultFromPositionServicePositionName()
    {
        // Arrange
        const int betTypeId = 12;
        const string position = "Position";
        var content = $"<BetTypes><BetType Id=\"{betTypeId}\"><Item Position=\"{position}\"/></BetType></BetTypes>";
        var item = new ItemElement
        {
            Position = position,
            Result = string.Empty
        };
        positionService.PositionName(betTypeId, item).Returns(string.Empty);

        // Act
        var remark = service.BetTypes(content, string.Empty);

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
        var content = $"<BetTypes><BetType Id=\"{betTypeId}\"><Item Position=\"{position}\" Result=\"{result}\"/></BetType></BetTypes>";

        positionService.PositionName(Arg.Any<int>(), Arg.Any<ItemElement>()).Returns(positionAndResult);

        // Act
        var remark = service.BetTypes(content, string.Empty);

        // Assert
        var expectedRemark = $"ResourceId: {betTypeId} | Result: {positionAndResult}<br/>";
        Assert.Equal(expectedRemark, remark);
    }
}