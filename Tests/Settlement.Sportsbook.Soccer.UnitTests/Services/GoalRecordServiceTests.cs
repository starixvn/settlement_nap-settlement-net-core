using Newtonsoft.Json;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Services;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services;

public class GoalRecordServiceTests
{
    private readonly IGoalRecordService service;

    public GoalRecordServiceTests()
    {
        service = new GoalRecordServiceImp();
    }

    [Fact]
    public void NoGoalFullTime_Always_ReturnsZeroFirstGoalLastGoal()
    {
        // Arrange
        const string expectedGoal = "FL:0-0;";

        // Act
        var actualGoal = service.NoGoalFullTime;

        // Assert
        Assert.Equal(expectedGoal, actualGoal);
    }

    [Theory]
    [InlineData("H", "1")]
    [InlineData("A", "2")]
    public void HomeOrAwayFirstGoal_InputGoalValue_ReturnsRightTeam(string goal, string expectedTeam)
    {
        // Act
        var actualTeam = service.HomeOrAwayFirstGoal(goal);

        // Assert
        Assert.Equal(expectedTeam, actualTeam);
    }

    [Fact]
    public void GoalRecordWithSemicolon_EmptyGoal_ReturnsZeroGoal()
    {
        // Arrange
        var goal = string.Empty;
        var expectedGoal = new GoalRecordModel
        {
            FirstGoal = "0",
            LastGoal = "0"
        };

        // Act
        var actualGoal = service.GoalRecordWithSemicolon(new GoalRecordModel(), goal);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expectedGoal), JsonConvert.SerializeObject(actualGoal));
    }

    [Theory]
    [InlineData("H", "1")]
    [InlineData("A", "2")]
    public void GoalRecordWithSemicolon_HasGoal_ReturnsRightGoal(string goal, string expected)
    {
        // Arrange
        var expectedGoal = new GoalRecordModel
        {
            FirstGoal = expected,
            LastGoal = expected
        };

        // Act
        var actualGoal = service.GoalRecordWithSemicolon(new GoalRecordModel(), goal);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expectedGoal), JsonConvert.SerializeObject(actualGoal));
    }

    [Theory]
    [InlineData("H;", "H")]
    [InlineData("A;H", "A")]
    [InlineData("H", "H")]
    public void HalftimeGoal_Always_ReturnHalfTimeGoal(string goalRecord, string expected)
    {
        //act
        var actual = service.HalftimeGoal(goalRecord);

        //assert
        Assert.Equal(expected, actual);
    }

    [Theory]
    [InlineData("H;", "")]
    [InlineData("A;H", "H")]
    [InlineData("H", "")]
    public void FullTimeGoal_Always_ReturnFullTimeGoal(string goalRecord, string expected)
    {
        //act
        var actual = service.FullTimeGoal(goalRecord);

        //assert
        Assert.Equal(expected, actual);
    }

    [Theory]
    [InlineData("", false, "N")]
    [InlineData("", true, "")]
    [InlineData("A;H", true, "H")]
    public void LastGoalRecord_Always_ReturnLastGoal(string goalRecord, bool isRefund, string expected)
    {
        //act
        var actual = service.LastGoalRecord(goalRecord, isRefund);

        //assert
        Assert.Equal(expected, actual);
    }

    [Theory]
    [InlineData("", false, "N")]
    [InlineData("", true, "")]
    [InlineData("A;H", true, "A")]
    public void FirstGoalRecord_Always_ReturnFirstGoal(string goalRecord, bool isRefund, string expected)
    {
        //act
        var actual = service.FirstGoalRecord(goalRecord, isRefund);

        //assert
        Assert.Equal(expected, actual);
    }
}