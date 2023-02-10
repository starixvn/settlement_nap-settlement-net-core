using NSubstitute;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Xunit;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services;

public class BetStatusAllServiceTests
{
    private readonly IValidationService validationService;
    private readonly IGoalRecordService goalRecordService;
    private readonly IBetStatusAllService service;

    public BetStatusAllServiceTests()
    {
        validationService = Substitute.For<IValidationService>();
        goalRecordService = Substitute.For<IGoalRecordService>();
        service = new BetStatusAllServiceImp(validationService, goalRecordService);
    }

    [Fact]
    public void GetBetStatus_ReturnsEmptyBetStatus()
    {
        // Arrange
        validationService.IsNullScoreAndGoalRecord(Arg.Any<SettleRequest>()).Returns(false);
        validationService.HasFinalScoreAndGoalRecord(Arg.Any<SettleRequest>()).Returns(false);

        // Act
        var actual = service.GetBetStatus(Arg.Any<SettleRequest>());

        // Assert
        Assert.Empty(actual);
    }

    [Fact]
    public void GetBetStatus_EmptyScoreAndGoal_ReturnsZeroOnFirstGoalLastGoal()
    {
        // Arrange
        var expected = "1FL:0-0;FL:0-0;";
        var query = new SettleRequest
        {
            IsExistFgLg = true,
            IsExistHtFgLg = true,
            GoalRecord = string.Empty
        };

        validationService.IsNullScoreAndGoalRecord(Arg.Any<SettleRequest>()).Returns(true);

        // Act
        var actual = service.GetBetStatus(query);

        // Assert
        Assert.Equal(expected, actual);
    }

    [Fact]
    public void GetBetStatus_HasFinalScoreAndGoal_ReturnsRightBetStatus()
    {
        // Arrange
        var goalRecord = new GoalRecordModel
        {
            IsExistFgLg = true,
            IsExistHtFgLg = true,
            FirstGoal = "1",
            LastGoal = "2"
        };

        var expected = "1FL:1-2;FL:1-2;";

        validationService.HasFinalScoreAndGoalRecord(Arg.Any<SettleRequest>()).Returns(true);

        goalRecordService.GoalRecordWithSemicolon(Arg.Any<GoalRecordModel>(), Arg.Any<string>()).Returns(goalRecord);

        // Act
        var actual = service.GetBetStatus(new SettleRequest { GoalRecord = ";" });

        // Assert
        Assert.Equal(expected, actual);
    }
}