using Newtonsoft.Json;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Sportsbook.MoveTickets.Services;
using Xunit;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Services
{
    public class ScoreSetServiceTests
    {
        private readonly IScoreSetService service;

        public ScoreSetServiceTests()
        {
            service = new ScoreSetService();
        }
        [Fact]
        public void GetScore_HasResultDetailWithSettlementStatusIdIsRefund_ReturnsROnScore()
        {
            // Arrange
            var resultDetail = new ResultDetail { MatchId = 1, SettlementStatusId = SettlementStatus.Refund };
            var expectedScore = new Score("R", "R");

            // Act
            var actualScore = service.GetScore(resultDetail);

            // Assert
            Assert.Equal(JsonConvert.SerializeObject(expectedScore), JsonConvert.SerializeObject(actualScore));
        }

        [Fact]
        public void GetScore_HasResultDetailWithSettlementStatusIdIsRefundHalftime_ReturnsRHTOnScore()
        {
            // Arrange
            var resultDetail = new ResultDetail { MatchId = 1, SettlementStatusId = SettlementStatus.RefundHT };
            var expectedScore = new Score("R.HT", "R.HT");

            // Act
            var actualScore = service.GetScore(resultDetail);

            // Assert
            Assert.Equal(JsonConvert.SerializeObject(expectedScore), JsonConvert.SerializeObject(actualScore));
        }

        [Fact]
        public void GetScore_HasResultDetailWithSettlementStatusIdIsRefundFullTime_ReturnsRFTOnScore()
        {
            // Arrange
            var resultDetail = new ResultDetail { MatchId = 1, SettlementStatusId = SettlementStatus.RefundFT };
            var expectedScore = new Score("R.FT", "R.FT");

            // Act
            var actualScore = service.GetScore(resultDetail);

            // Assert
            Assert.Equal(JsonConvert.SerializeObject(expectedScore), JsonConvert.SerializeObject(actualScore));
        }

        [Fact]
        public void GetScore_HasResultDetailWithSettlementStatusIdIsCompleted_ReturnsCorrectScoreAndHasBackgroundColor()
        {
            // Arrange
            var resultDetail = new ResultDetail { MatchId = 1, HomeValue = "1", AwayValue = "2", SettlementStatusId = SettlementStatus.Completed };
            var expectedScore = new Score("1", "2", Background.Calculated);

            // Act
            var actualScore = service.GetScore(resultDetail);

            // Assert
            Assert.Equal(JsonConvert.SerializeObject(expectedScore), JsonConvert.SerializeObject(actualScore));
        }

        [Fact]
        public void GetScore_HasResultDetailWithSettlementStatusIdIsRunningAndScoreIsNull_ReturnsHyphenOnScore()
        {
            // Arrange
            var resultDetail = new ResultDetail { MatchId = 1, SettlementStatusId = SettlementStatus.Running };
            var expectedScore = new Score("-", "-");

            // Act
            var actualScore = service.GetScore(resultDetail);

            // Assert
            Assert.Equal(JsonConvert.SerializeObject(expectedScore), JsonConvert.SerializeObject(actualScore));
        }

        [Fact]
        public void GetScore_HasResultDetailWithSettlementStatusIdIsRunningAndScoreIsNotNull_ReturnsCorrectScore()
        {
            // Arrange
            var resultDetail = new ResultDetail { MatchId = 1, HomeValue = "1", AwayValue = "2", SettlementStatusId = SettlementStatus.Running };
            var expectedScore = new Score("1", "2");


            // Act
            var actualScore = service.GetScore(resultDetail);

            // Assert
            Assert.Equal(JsonConvert.SerializeObject(expectedScore), JsonConvert.SerializeObject(actualScore));
        }
    }
}
