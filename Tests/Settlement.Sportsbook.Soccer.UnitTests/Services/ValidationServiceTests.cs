using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services;

public class ValidationServiceTests
{
    private readonly ValidationServiceImp service = new ValidationServiceImp();

    [Theory]
    [InlineData("", 0, -1, false)]
    [InlineData("AH;", 0, 1, false)]
    [InlineData("AH", -1, -1, false)]
    [InlineData("AH", 0, -1, true)]
    public void HasHalftimeScoreWithoutSemicolonOnGoalRecord_InputGoalRecordAndHalftimeScore_ReturnsRightExpectedData(
        string goalRecord,
        int homeScore,
        int awayScore,
        bool expectedData)
    {
        // Arrange
        var query = new SettleRequest
        {
            GoalRecord = goalRecord,
            HalfTimeAwayScore = awayScore,
            HalfTimeHomeScore = homeScore
        };

        // Act
        var actual = service.HasHalftimeScoreWithoutSemicolonOnGoalRecord(query);

        // Assert
        Assert.Equal(expectedData, actual);
    }

    [Theory]
    [InlineData("", 0, -1, false)]
    [InlineData("AH", 0, 1, false)]
    [InlineData("AH;", -1, -1, false)]
    [InlineData("AH;", 0, -1, true)]
    public void HasHalftimeScoreWithSemicolonOnGoalRecord_InputGoalRecordAndHalftimeScore_ReturnsRightExpectedData(
        string goalRecord,
        int homeScore,
        int awayScore,
        bool expectedData)
    {
        // Arrange
        var query = new SettleRequest
        {
            GoalRecord = goalRecord,
            HalfTimeAwayScore = awayScore,
            HalfTimeHomeScore = homeScore
        };

        // Act
        var actual = service.HasHalftimeScoreWithSemicolonOnGoalRecord(query);

        // Assert
        Assert.Equal(expectedData, actual);
    }

    [Theory]
    [InlineData("", 1, false)]
    [InlineData(";", 1, false)]
    [InlineData("AH", 0, false)]
    [InlineData("", 0, true)]
    [InlineData(";", 0, true)]
    public void IsNullScoreAndGoalRecord_InputGoalRecordAndScore_ReturnsRightExpectedData(string goalRecord, int? score, bool expectedData)
    {
        // Arrange
        var query = new SettleRequest
        {
            GoalRecord = goalRecord,
            HalfTimeAwayScore = score,
            HalfTimeHomeScore = score,
            FinalHomeScore = score,
            FinalAwayScore = score
        };

        // Act
        var actual = service.IsNullScoreAndGoalRecord(query);

        // Assert
        Assert.Equal(expectedData, actual);
    }

    [Theory]
    [InlineData("", 0, false)]
    [InlineData(";", 0, false)]
    [InlineData("AH", null, false)]
    [InlineData("AH", 0, true)]
    public void HasFinalScoreAndSemicolonOnGoalRecord_InputGoalRecordAndFinalScore_ReturnsRightExpectedData(string goalRecord, int? score, bool expectedData)
    {
        // Arrange
        var query = new SettleRequest
        {
            GoalRecord = goalRecord,
            FinalHomeScore = score,
            FinalAwayScore = score
        };

        // Act
        var actual = service.HasFinalScoreAndSemicolonOnGoalRecord(query);

        // Assert
        Assert.Equal(expectedData, actual);
    }

    [Theory]
    [InlineData("", 0, false)]
    [InlineData(";", 0, false)]
    [InlineData("AH", null, false)]
    [InlineData("", null, true)]
    public void IsNullHalftimeScoreAndGoalRecord_InputGoalRecordAndHalftimeScore_ReturnsRightExpectedData(string goalRecord, int? score, bool expectedData)
    {
        // Arrange
        var query = new SettleRequest
        {
            GoalRecord = goalRecord,
            HalfTimeAwayScore = score,
            HalfTimeHomeScore = score
        };

        // Act
        var actual = service.IsNullHalftimeScoreAndGoalRecord(query);

        // Assert
        Assert.Equal(expectedData, actual);
    }

    [Theory]
    [InlineData("", 0, false)]
    [InlineData("AH", null, false)]
    [InlineData(";", 0, true)]
    [InlineData("AH", 0, true)]
    public void HasFinalScoreAndGoalRecord_InputGoalRecordAndFinalScore_ReturnsRightExpectedData(string goalRecord, int? score, bool expectedData)
    {
        // Arrange
        var query = new SettleRequest
        {
            GoalRecord = goalRecord,
            FinalHomeScore = score,
            FinalAwayScore = score
        };

        // Act
        var actual = service.HasFinalScoreAndGoalRecord(query);

        // Assert
        Assert.Equal(expectedData, actual);
    }

    [Theory]
    [InlineData("CAL", "Refund HT;", false)]
    [InlineData("CAL-FT", "", false)]
    [InlineData("CAL-FT", "Refund HT;", true)]
    public void IsRefundHalftime_InputActionNameAndBetStatus_ReturnsRightExpectedData(string actionName, string betStatus, bool expectedData)
    {
        // Arrange
        var query = new SettleRequest
        {
            ActionName = actionName,
            BetStatus = betStatus
        };

        // Act
        var actual = service.IsRefundHalftime(query);

        // Assert
        Assert.Equal(expectedData, actual);
    }

    [Theory]
    [InlineData("CAL", "Refund HT;", false)]
    [InlineData("CAL-HT", "", false)]
    [InlineData("CAL-HT", "Refund FT;", true)]
    [InlineData("CAL-HT", "Abandoned 2H;", true)]
    public void IsRefundFullTime_InputActionNameAndBetStatus_ReturnsRightExpectedData(string actionName, string betStatus, bool expectedData)
    {
        // Arrange
        var query = new SettleRequest
        {
            ActionName = actionName,
            BetStatus = betStatus
        };

        // Act
        var actual = service.IsRefundFullTime(query);

        // Assert
        Assert.Equal(expectedData, actual);
    }

    [Theory]
    [InlineData(false, false, false)]
    [InlineData(true, false, true)]
    [InlineData(false, true, true)]
    public void IsExistFirstGoalLastGoal_InputFirstLastGoal_ReturnsRightExpectedData(bool isExistFgLg, bool isExistHtFgLg, bool expectedData)
    {
        // Arrange
        var query = new SettleRequest
        {
            IsExistFgLg = isExistFgLg,
            IsExistHtFgLg = isExistHtFgLg
        };

        // Act
        var actual = service.IsExistFirstGoalLastGoal(query);

        // Assert
        Assert.Equal(expectedData, actual);
    }
}