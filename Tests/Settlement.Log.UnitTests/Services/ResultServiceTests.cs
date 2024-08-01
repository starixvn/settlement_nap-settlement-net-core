using Settlement.Log.Services;

namespace Settlement.Log.UnitTests.Services;

public class ResultServiceTests
{
    private readonly ResultService service = new ResultServiceImp();

    [Theory]
    [InlineData(null)]
    [InlineData("0")]
    [InlineData("5")]
    public void MinuteSetPieceResultName_FromResultIsNotOneAndCornerFreeKickGoalKickAndPenalty_ReturnResultNameIsEmpty(string result)
    {
        // Arrange
        const string position = "Position";

        // Act
        var resultName = service.MinuteSetPieceResultName(position, result);

        // Assert
        const string expectedResultName = $"{position}:";
        Assert.Equal(expectedResultName, resultName);
    }

    [Fact]
    public void MinuteSetPieceResultName_FromResultIsOne_ReturnResultNameIsNo()
    {
        // Arrange
        const string position = "Position";

        // Act
        var resultName = service.MinuteSetPieceResultName(position, "1");

        // Assert
        const string expectedResultName = $"{position}:No";
        Assert.Equal(expectedResultName, resultName);
    }

    [Fact]
    public void MinuteSetPieceResultName_FromResultIsCornerFreeKickGoalKickAndPenalty_ReturnResultNameIsYes()
    {
        // Arrange
        const string position = "Position";
        const string cornerFreeKickGoalKickAndPenalty = "44";

        // Act
        var resultName = service.MinuteSetPieceResultName(position, cornerFreeKickGoalKickAndPenalty);

        // Assert
        const string expectedResultName = $"{position}:Yes";
        Assert.Equal(expectedResultName, resultName);
    }

    [Fact]
    public void ResultName_FromResultIsEmptyOrWhiteSpaceZero_ReturnsContainsEmptyResultName()
    {
        // Arrange
        const string position = "Position";

        // Act
        var resultName = service.ResultName(position, "0");

        // Assert
        const string expectedResultName = $"{position}:";
        Assert.Equal(expectedResultName, resultName);
    }

    [Theory]
    [InlineData("1", "N")]
    [InlineData("2", "G")]
    [InlineData("4", "C")]
    [InlineData("8", "FK")]
    [InlineData("16", "GK")]
    [InlineData("32", "T")]
    [InlineData("64", "B")]
    [InlineData("3", "N,G")]
    [InlineData("129", "N,P")]
    [InlineData("7", "N,G,C")]
    [InlineData("120", "FK,GK,T,B")]
    public void ResultName_FromResult_ReturnsExpectedResultName(string result, string expectedResult)
    {
        // Arrange
        const string position = "Position";

        // Act
        var resultName = service.ResultName(position, result);

        // Assert
        var expectedResultName = $"{position}:{expectedResult}";
        Assert.Equal(expectedResultName, resultName);
    }
}