using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Xunit;

namespace Settlement.Core.UnitTests.Services;

public class ScoreSetServiceTests
{
    private readonly ScoreSetServiceImp service = new ScoreSetServiceImp();

    private const bool isLeader = true;

    [Fact]
    public void GetScore_HasResultDetailWithSettlementStatusIdIsRefund_ReturnsROnScore()
    {
        // Arrange
        var resultDetail = new ResultDetail { MatchId = 1, SettlementStatusId = SettlementStatus.Refund };
        var expectedScore = new Score("R", "R");

        // Act
        var actualScore = service.GetScore(resultDetail, isLeader);

        // Assert
        AssertExtension.AreEqual(expectedScore, actualScore);
    }

    [Fact]
    public void GetScore_HasResultDetailWithSettlementStatusIdIsRefundHalftime_ReturnsRHTOnScore()
    {
        // Arrange
        var resultDetail = new ResultDetail { MatchId = 1, SettlementStatusId = SettlementStatus.RefundHt };
        var expectedScore = new Score("R.HT", "R.HT");

        // Act
        var actualScore = service.GetScore(resultDetail, isLeader);

        // Assert
        AssertExtension.AreEqual(expectedScore, actualScore);
    }

    [Fact]
    public void GetScore_HasResultDetailWithSettlementStatusIdIsRefundFullTime_ReturnsRFTOnScore()
    {
        // Arrange
        var resultDetail = new ResultDetail { MatchId = 1, SettlementStatusId = SettlementStatus.RefundFt };
        var expectedScore = new Score("R.FT", "R.FT");

        // Act
        var actualScore = service.GetScore(resultDetail, isLeader);

        // Assert
        AssertExtension.AreEqual(expectedScore, actualScore);
    }

    [Fact]
    public void GetScore_HasResultDetailWithSettlementStatusIdIsCompleted_ReturnsCorrectScoreAndHasBackgroundColor()
    {
        // Arrange
        var resultDetail = new ResultDetail { MatchId = 1, HomeValue = "1", AwayValue = "2", SettlementStatusId = SettlementStatus.Completed };
        var expectedScore = new Score("1", "2", Background.Calculated);

        // Act
        var actualScore = service.GetScore(resultDetail, isLeader);

        // Assert
        AssertExtension.AreEqual(expectedScore, actualScore);
    }

    [Fact]
    public void GetScore_HasResultDetailWithSettlementStatusIdIsRunningAndScoreIsNull_ReturnsHyphenOnScore()
    {
        // Arrange
        var resultDetail = new ResultDetail { MatchId = 1, SettlementStatusId = SettlementStatus.Running };
        var expectedScore = new Score("-", "-")
        {
            IsNotSettled = true
        };

        // Act
        var actualScore = service.GetScore(resultDetail, true);

        // Assert
        AssertExtension.AreEqual(expectedScore, actualScore);
    }

    [Fact]
    public void GetScore_HasResultDetailWithSettlementStatusIdIsRunningAndScoreIsNotNull_ReturnsCorrectScore()
    {
        // Arrange
        var resultDetail = new ResultDetail
        {
            MatchId = 1,
            HomeValue = "1",
            AwayValue = "2",
            SettlementStatusId = SettlementStatus.Running,
            ResultStatusId = ResultStatus.Confirmed
        };
        var expectedScore = new Score("1", "2")
        {
            IsNotSettled = true,
            IsConfirmed = true
        };

        // Act
        var actualScore = service.GetScore(resultDetail, true);

        // Assert
        AssertExtension.AreEqual(expectedScore, actualScore);
    }
}