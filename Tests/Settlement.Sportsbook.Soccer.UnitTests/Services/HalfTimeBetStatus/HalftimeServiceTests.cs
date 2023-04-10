namespace Settlement.Sportsbook.Soccer.UnitTests.Services.HalfTimeBetStatus;

using Models;
using Requests;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.HalfTimeBetStatus;

public class HalftimeServiceTests
{
    private readonly IValidationService validationService;

    private readonly IHalftimeScoreAndGoalService halftimeScoreAndGoalService;

    private readonly IHalftimeService service;

    public HalftimeServiceTests()
    {
        validationService = Substitute.For<IValidationService>();
        halftimeScoreAndGoalService = Substitute.For<IHalftimeScoreAndGoalService>();
        service = new HalftimeServiceImp(validationService, halftimeScoreAndGoalService);
    }

    [Fact]
    public void GetBetStatusForCalculateHalfTime_HasGoalWithSemicolon_CallBetStatusHasHalftimeScoreWithSemicolonOnGoalRecordMethod()
    {
        // Arrange
        validationService.HasHalftimeScoreWithSemicolonOnGoalRecord(Arg.Any<SettleRequest>()).Returns(true);

        // Act
        service.GetBetStatusForCalculateHalfTime(new SettleRequest { GoalRecord = "abc" });

        // Assert
        halftimeScoreAndGoalService.Received().BetStatusHasHalftimeScoreWithSemicolonOnGoalRecord("ABC");
    }

    [Fact]
    public void GetBetStatusForCalculateHalfTime_IsNoGoal_ReturnsRightBetStatusFromNoGoalHalftime()
    {
        // Arrange
        var goalRecord = new GoalRecordModel
        {
            IsExistHtFgLg = true,
            FirstGoal = "0",
            LastGoal = "0"
        };

        var expectedBetStatus = goalRecord.HalftimeBetStatus;

        validationService.IsNullHalftimeScoreAndGoalRecord(Arg.Any<SettleRequest>()).Returns(true);
        halftimeScoreAndGoalService.NoGoalHalftime.Returns("1FL:0-0;");

        // Act
        var actualBetStatus = service.GetBetStatusForCalculateHalfTime(new SettleRequest());

        // Assert
        Assert.Equal(expectedBetStatus, actualBetStatus);
    }

    [Fact]
    public void GetBetStatusForCalculateHalfTime_HasGoalWithoutSemicolon_CallBetStatusHasHalftimeScoreWithoutSemicolonOnGoalRecordMethod()
    {
        // Arrange
        validationService.HasHalftimeScoreWithoutSemicolonOnGoalRecord(Arg.Any<SettleRequest>()).Returns(true);

        // Act
        service.GetBetStatusForCalculateHalfTime(new SettleRequest { GoalRecord = "abc" });

        // Assert
        halftimeScoreAndGoalService.Received().BetStatusHasHalftimeScoreWithoutSemicolonOnGoalRecord("ABC");
    }

    [Fact]
    public void GetBetStatusForCalculateHalfTime_ReturnsEmptyBetStatus()
    {
        // Act
        var actualBetStatus = service.GetBetStatusForCalculateHalfTime(Arg.Any<SettleRequest>());

        // Assert
        Assert.Empty(actualBetStatus);
    }

    [Fact]
    public void AppendHalfTimeBetStatus_EmptyBetStatus_ReturnsDefaultHalftimeBetStatus()
    {
        // Arrange
        const string halftimeBetStatus = "1FL:1-0;";

        // Act
        var actualBetStatus = service.AppendHalfTimeBetStatus(string.Empty, halftimeBetStatus);

        // Assert
        Assert.Equal(halftimeBetStatus, actualBetStatus);
    }

    [Fact]
    public void AppendHalfTimeBetStatus_NotEmptyBetStatus_ReturnsHalftimeBetStatusPlusOldBetStatus()
    {
        // Arrange
        const string oldBetStatus = "FL:1-0;";
        const string halftimeBetStatus = "1FL:1-0;";
        const string expectedBetStatus = "1FL:1-0;FL:1-0;";

        // Act
        var actualBetStatus = service.AppendHalfTimeBetStatus(oldBetStatus, halftimeBetStatus);

        // Assert
        Assert.Equal(expectedBetStatus, actualBetStatus);
    }

    [Fact]
    public void AppendHalfTimeBetStatus_Exist1FLOnBetStatus_CallHasFirstGoalOnBetStatusMethodOfHalftimeScoreAndGoalService()
    {
        // Arrange
        const string oldBetStatus = "1FL:1-0;";

        // Act
        service.AppendHalfTimeBetStatus(oldBetStatus, string.Empty);

        // Assert
        halftimeScoreAndGoalService.Received().HasFirstGoalOnBetStatus(Arg.Any<string>(), Arg.Any<string>());
    }

    [Theory]
    [InlineData("")]
    [InlineData(";")]
    public void FullTimeBetStatusForCalculateHalfTime_GoalRecordEmpty_ReturnsEmpty(string goalRecord)
    {
        // Act
        var actual = service.FullTimeBetStatusForCalculateHalfTime(goalRecord);

        // Assert
        Assert.Empty(actual);
    }

    [Fact]
    public void FullTimeBetStatusForCalculateHalfTime_GoalRecord_ReturnsExpectedBetStatus()
    {
        // Arrange
        const string goalRecord = "AH;HHH";
        const string expectedBetStatus = "FL:2:0";
        halftimeScoreAndGoalService.FullTimeBetStatus(Arg.Any<string>()).Returns(expectedBetStatus);

        // Act
        var actualBetStatus = service.FullTimeBetStatusForCalculateHalfTime(goalRecord);

        // Assert
        Assert.Equal(expectedBetStatus, actualBetStatus);
    }

    [Theory]
    [InlineData("1FL:1-0;", "", "1FL:1-0;")]
    [InlineData("Refund;1FL:1-0;", "", "Refund;1FL:1-0;")]
    [InlineData("", "FL:x-0;", "FL:x-0;")]
    [InlineData("1FL:1-0;", "FL:2-0;", "1FL:1-0;FL:2-0;")]
    [InlineData("FL:1-0;", "FL:2-0;", "FL:2-0;")]

    public void AppendFullTimeBetStatus_BetStatus_ReturnsExpectedNewBetStatus(string betStatus, string fullTimeBetStatus, string expectedNewBetStatus)
    {
        // Act
        var actualBetStatus = service.AppendFullTimeBetStatus(betStatus, fullTimeBetStatus);

        // Assert
        Assert.Equal(expectedNewBetStatus, actualBetStatus);
    }
}