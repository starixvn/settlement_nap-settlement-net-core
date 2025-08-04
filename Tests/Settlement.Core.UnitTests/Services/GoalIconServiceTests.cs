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
    [CombinatorialData]
    public void GetGoalIcon_BetStatusAndGoalRecordAreNullOrWhitespace_AllScoreIsNull(
        [CombinatorialValues(null, "  ")] string betStatus,
        [CombinatorialValues(null, "", " ")] string goalRecord)
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
    [CombinatorialData]
    public void GetGoalIcon_BetStatusOrGoalRecordNotNullOrWhitespaceAndIsNotExistHtFgLg_ReturnsHalfGoalIconIsNull(
        [CombinatorialValues(null, "A")] string betStatus,
        [CombinatorialValues("H", "")] string goalRecord)
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
    [CombinatorialData]
    public void GetGoalIcon_BetStatusNotNullOrWhitespaceAndIsExistHtFgLg_ReturnsHalfGoalIconByBetStatus(
        [CombinatorialValues("A", "1-2")] string betStatus)
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
    [CombinatorialData]
    public void GetGoalIconBetStatusGetGoalIconBetStatusNullOrWhitespaceAndGoalRecordNotNullOrWhitespaceAndIsExistHtFgLgReturnsHalfGoalIconByBetStatus(
        [CombinatorialValues(null, "  ")] string betStatus,
        [CombinatorialValues("A;H", "HA;")] string goalRecord)
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
    [CombinatorialData]
    public void GetGoalIcon_BetStatusOrGoalRecordNotNullOrWhitespaceAndIsNotExistFgLg_ReturnsHalfGoalIconIsNull(
        [CombinatorialValues(null, "A")] string betStatus,
        [CombinatorialValues("H", "")] string goalRecord)
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
    [CombinatorialData]
    public void GetGoalIcon_BetStatusNotNullOrWhitespaceAndIsExistFgLg_ReturnsHalfGoalIconByBetStatus(
        [CombinatorialValues("A", "1-2")] string betStatus)
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
    [CombinatorialData]
    public void GetGoalIconBetStatusGetBetStatusNullOrWhitespaceAndGoalRecordNotNullOrWhitespaceAndIsExistFgLgReturnsHalfGoalIconByBetStatus(
        [CombinatorialValues(null, "  ")] string betStatus,
        [CombinatorialValues("A;H", "HA;")] string goalRecord)
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