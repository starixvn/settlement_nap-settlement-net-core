using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.FullTimeBetStatus;

public class FirstGoalLastGoalServiceTests
{
    private readonly IGoalRecordService goalRecordService;

    private readonly FirstLastGoalService service;

    public FirstGoalLastGoalServiceTests()
    {
        goalRecordService = Substitute.For<IGoalRecordService>();

        service = new FirstLastGoalServiceImp(goalRecordService);
    }

    [Theory]
    [InlineData("1FL:0-0;FL:1-1;", "1FL:0-0;FL:0-0;")]
    [InlineData("1FL:0-0;", "1FL:0-0;FL:0-0;")]
    public void FirstGoalOnBetStatus_InputOldBetStatus_ReturnRightBetStatus(string oldBetStatus, string expected)
    {
        // Arrange
        goalRecordService.NoGoalFullTime.Returns("FL:0-0;");

        // Act
        var actual = service.FirstGoalOnBetStatus(oldBetStatus);

        // Assert
        Assert.Equal(expected, actual);
    }

    [Theory]
    [InlineData("FL:1-1;", "FL:0-0;")]
    [InlineData("", "FL:0-0;")]
    public void LastGoalOnBetStatus_InputOldBetStatus_ReturnRightBetStatus(string oldBetStatus, string expected)
    {
        // Arrange
        goalRecordService.NoGoalFullTime.Returns("FL:0-0;");

        // Act
        var actual = service.LastGoalOnBetStatus(oldBetStatus);

        // Assert
        Assert.Equal(expected, actual);
    }
}