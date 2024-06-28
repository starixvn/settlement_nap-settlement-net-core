using Settlement.Constants;
using Settlement.Log.Models.BetTypeElement;
using Settlement.Log.Services;

namespace Settlement.Log.UnitTests.Services;

public class PositionServiceTests
{
    private readonly ResultService resultService;
    private readonly PositionService service;

    public PositionServiceTests()
    {
        resultService = Substitute.For<ResultService>();
        service = new PositionServiceImp(resultService);
    }

    [Fact]
    public void PositionName_FromResultIsNullOrWhiteSpace_ReturnsPosition()
    {
        // Arrange
        const string position = "Position";
        var item = new BetTypeItemElement
        {
            Position = "Position",
            Result = string.Empty
        };

        // Act
        var positionName = service.PositionName(0, item);

        // Assert
        Assert.Equal(position, positionName);
    }

    [Fact]
    public void PositionName_FromResultIsNullAndBetTypeTimeMachineHandicap_ReturnsPosition()
    {
        // Arrange
        const string position = "44+-49";
        var item = new BetTypeItemElement
        {
            Position = "Position",
            Result = string.Empty,
            MinPosition = "45",
            MaxPosition = "50"
        };

        // Act
        var positionName = service.PositionName(BetType.FastMarketBetType.TimeMachineHandicap, item);

        // Assert
        Assert.Equal(position, positionName);
    }

    [Fact]
    public void PositionName_FromResultIsNullAndBetTypeNextOneMinuteSetPiece_ReturnsExpectedPosition()
    {
        // Arrange
        const string position = "Position MinuteSetPieceResultName";
        var item = new BetTypeItemElement
        {
            Position = "Position",
            Result = "R1",
            MinPosition = "45",
            MaxPosition = "50"
        };

        // Act
        resultService.MinuteSetPieceResultName(Arg.Any<string>(), Arg.Any<string>()).Returns(position);
        var positionName = service.PositionName(BetType.FastMarketBetType.NextOneMinuteSetPiece, item);

        // Assert
        Assert.Equal(position, positionName);
    }

    [Theory]
    [InlineData("R1", "P1")]
    [InlineData("R1,R2", "P1,P2")]
    public void PositionName_FromResultIsNotNullAndWhiteSpaceAndBetTypeIdIsNotNextOneMinuteSetPiece_CallResultServiceResultName(
        string result,
        string position)
    {
        // Arrange
        var item = new BetTypeItemElement
        {
            Position = position,
            Result = result
        };

        // Act
        service.PositionName(0, item);

        // Assert
        resultService.Received(result.Split(',').Length).ResultName(Arg.Any<string>(), Arg.Any<string>());
    }

    [Theory]
    [InlineData("R1,R3,R4", "P1,P3,P4")]
    [InlineData("R1,R2", "P1,P2")]
    public void PositionName_FromResultIsNotNullAndWhiteSpaceAndHasManyResults_ReturnsSeparatedBySemicolon(
        string result,
        string position)
    {
        // Arrange
        var item = new BetTypeItemElement
        {
            Position = position,
            Result = result
        };

        // Act
        var positionName = service.PositionName(0, item);

        // Assert
        Assert.Contains("; ", positionName);
    }

    [Fact]
    public void PositionName_FromResultIsNotNullAndBetTypeTimeMachineHandicap_ReturnsPosition()
    {
        // Arrange
        const string position = "44+-49(1(8-0),2(5-1),3(5-3))";
        var item = new BetTypeItemElement
        {
            Position = "1,2,3",
            Result = "8,15,35",
            MinPosition = "45",
            MaxPosition = "50"
        };

        // Act
        var positionName = service.PositionName(BetType.FastMarketBetType.TimeMachineHandicap, item);

        // Assert
        Assert.Equal(position, positionName);
    }
}