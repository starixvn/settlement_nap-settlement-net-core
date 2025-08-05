using NSubstitute;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Xunit;

namespace Settlement.Core.UnitTests.Services;

public class GoalIconServiceTests
{
    private readonly FirstGoalLastGoalService firstGoalLastGoalService;

    private readonly GoalIconServiceImp service;

    public GoalIconServiceTests()
    {
        firstGoalLastGoalService = Substitute.For<FirstGoalLastGoalService>();
        service = new GoalIconServiceImp(firstGoalLastGoalService);
    }

    [Theory]
    [InlineData(null, null)]
    [InlineData(null, "")]
    [InlineData(null, " ")]
    [InlineData("  ", null)]
    [InlineData("  ", "")]
    [InlineData("  ", " ")]
    public void GetGoalIcon_BetStatusAndGoalRecordAreNullOrWhitespace_AllScoreIsNull(
        string betStatus,
        string goalRecord)
    {
        // Arrange
        var query = new GoalIconQueryModel
        {
            BetStatus = betStatus,
            GoalRecord = goalRecord
        };

        // Act
        var goalIcon = service.GetGoalIcon(query);

        // Assert
        Assert.True(goalIcon.HalfTimeAwayGoal == null && goalIcon.HalfTimeHomeGoal == null
                                                      && goalIcon.HomeGoal == null && goalIcon.AwayGoal == null);
    }

    [Theory]
    [InlineData(null, "H")]
    [InlineData(null, "")]
    [InlineData("A", "H")]
    [InlineData("A", "")]
    public void GetGoalIcon_BetStatusOrGoalRecordNotNullOrWhitespaceAndIsNotExistHtFgLg_ReturnsHalfGoalIconIsNull(
        string betStatus,
        string goalRecord)
    {
        // Arrange
        var query = new GoalIconQueryModel
        {
            BetStatus = betStatus,
            GoalRecord = goalRecord,
            IsExistHtFgLg = false
        };

        // Act
        var goalIcon = service.GetGoalIcon(query);

        // Assert
        Assert.True(goalIcon.HalfTimeAwayGoal == null && goalIcon.HalfTimeHomeGoal == null);
    }

    [Theory]
    [InlineData("A")]
    [InlineData("1-2")]
    public void GetGoalIcon_BetStatusNotNullOrWhitespaceAndIsExistHtFgLg_ReturnsHalfGoalIconByBetStatus(
        string betStatus)
    {
        // Arrange
        const string homeFirstLastGoal = "Home First Last Goal";
        const string awayFirstLastGoal = "Away First Last Goal";
        var query = new GoalIconQueryModel
        {
            BetStatus = betStatus,
            IsExistHtFgLg = true
        };
        firstGoalLastGoalService.GetHalftimeGoalByBetStatus(query).Returns(new GoalModel
        {
            Home = homeFirstLastGoal,
            Away = awayFirstLastGoal
        });

        // Act
        var goalIcon = service.GetGoalIcon(query);

        // Assert
        Assert.True(goalIcon.HalfTimeAwayGoal.Equals(awayFirstLastGoal) && goalIcon.HalfTimeHomeGoal.Equals(homeFirstLastGoal));
    }

    [Theory]
    [InlineData(null, "A;H")]
    [InlineData(null, "HA;")]
    [InlineData("  ", "A;H")]
    [InlineData("  ", "HA;")]
    public void GetGoalIconBetStatusGetGoalIconBetStatusNullOrWhitespaceAndGoalRecordNotNullOrWhitespaceAndIsExistHtFgLgReturnsHalfGoalIconByBetStatus(
        string betStatus,
        string goalRecord)
    {
        // Arrange
        const string homeFirstLastGoal = "Home First Last Goal";
        const string awayFirstLastGoal = "Away First Last Goal";
        var query = new GoalIconQueryModel
        {
            BetStatus = betStatus,
            GoalRecord = goalRecord,
            IsExistHtFgLg = true
        };
        firstGoalLastGoalService.GetHalftimeGoalByGoalRecord(goalRecord).Returns(new GoalModel
        {
            Home = homeFirstLastGoal,
            Away = awayFirstLastGoal
        });

        // Act
        var goalIcon = service.GetGoalIcon(query);

        // Assert
        Assert.True(goalIcon.HalfTimeAwayGoal.Equals(awayFirstLastGoal) && goalIcon.HalfTimeHomeGoal.Equals(homeFirstLastGoal));
    }

    [Theory]
    [InlineData(null, "H")]
    [InlineData(null, "")]
    [InlineData("A", "H")]
    [InlineData("A", "")]
    public void GetGoalIcon_BetStatusOrGoalRecordNotNullOrWhitespaceAndIsNotExistFgLg_ReturnsHalfGoalIconIsNull(
        string betStatus,
        string goalRecord)
    {
        // Arrange
        var query = new GoalIconQueryModel
        {
            BetStatus = betStatus,
            GoalRecord = goalRecord,
            IsExistHtFgLg = false
        };

        // Act
        var goalIcon = service.GetGoalIcon(query);

        // Assert
        Assert.True(goalIcon.HomeGoal == null && goalIcon.AwayGoal == null);
    }

    [Theory]
    [InlineData("A")]
    [InlineData("1-2")]
    public void GetGoalIcon_BetStatusNotNullOrWhitespaceAndIsExistFgLg_ReturnsHalfGoalIconByBetStatus(
        string betStatus)
    {
        // Arrange
        const string homeFirstLastGoal = "Home First Last Goal";
        const string awayFirstLastGoal = "Away First Last Goal";
        var query = new GoalIconQueryModel
        {
            BetStatus = betStatus,
            IsExistFgLg = true
        };
        firstGoalLastGoalService.GetFullTimeGoalByBetStatus(query).Returns(new GoalModel
        {
            Home = homeFirstLastGoal,
            Away = awayFirstLastGoal
        });

        // Act
        var goalIcon = service.GetGoalIcon(query);

        // Assert
        Assert.True(goalIcon.AwayGoal.Equals(awayFirstLastGoal) && goalIcon.HomeGoal.Equals(homeFirstLastGoal));
    }

    [Theory]
    [InlineData(null, "A;H")]
    [InlineData(null, "HA;")]
    [InlineData("  ", "A;H")]
    [InlineData("  ", "HA;")]
    public void GetGoalIconBetStatusGetBetStatusNullOrWhitespaceAndGoalRecordNotNullOrWhitespaceAndIsExistFgLgReturnsHalfGoalIconByBetStatus(
        string betStatus,
        string goalRecord)
    {
        // Arrange
        const string homeFirstLastGoal = "Home First Last Goal";
        const string awayFirstLastGoal = "Away First Last Goal";
        var query = new GoalIconQueryModel
        {
            BetStatus = betStatus,
            GoalRecord = goalRecord,
            IsExistFgLg = true
        };
        firstGoalLastGoalService.GetFullTimeGoalByGoalRecord(goalRecord, Arg.Any<bool>()).Returns(new GoalModel
        {
            Home = homeFirstLastGoal,
            Away = awayFirstLastGoal
        });

        // Act
        var goalIcon = service.GetGoalIcon(query);

        // Assert
        Assert.True(goalIcon.AwayGoal.Equals(awayFirstLastGoal) && goalIcon.HomeGoal.Equals(homeFirstLastGoal));
    }
}