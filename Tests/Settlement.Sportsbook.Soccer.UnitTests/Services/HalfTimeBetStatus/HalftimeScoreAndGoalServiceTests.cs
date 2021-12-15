using NSubstitute;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.HalfTimeBetStatus;
using Xunit;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.HalftimeBetStatus
{
    public class HalftimeScoreAndGoalServiceTests
    {
        private readonly IGoalRecordService goalRecordService;

        private readonly IHalftimeScoreAndGoalService service;

        public HalftimeScoreAndGoalServiceTests()
        {
            goalRecordService = Substitute.For<IGoalRecordService>();
            service = new HalftimeScoreAndGoalServiceImp(goalRecordService);
        }

        [Theory]
        [InlineData("1FL:1-2;FL:1-1;", "1FL:0-0;", "1FL:0-0;FL:1-1;")]
        [InlineData("1FL:1-2", "1FL:2-2", "1FL:2-2")]
        public void HasFirstGoalOnBetStatus_BetStatusHasSemicolonOrNot_ReturnsRightExpectedBetStatus(
            string betStatus,
            string halfTimeBetStatus,
            string expectedBetStatus)
        {
            // Act
            var actualBetStatus = service.HasFirstGoalOnBetStatus(betStatus, halfTimeBetStatus);

            // Assert
            Assert.Equal(expectedBetStatus, actualBetStatus);
        }

        [Fact]
        public void BetStatusHasHalftimeScoreWithoutSemicolonOnGoalRecord_ReturnsRightExpectedBetStatus()
        {
            // Arrange
            var expectedBetStatus = "1FL:2-0;";
            goalRecordService.HomeOrAwayFirstGoal(Arg.Any<string>()).Returns("2");

            // Act
            var actualBetStatus = service.BetStatusHasHalftimeScoreWithoutSemicolonOnGoalRecord(new SettleRequest());

            // Assert
            Assert.Equal(expectedBetStatus, actualBetStatus);
        }

        [Fact]
        public void BetStatusHasHalftimeScoreWithSemicolonOnGoalRecord_ReturnsRightExpectedBetStatus()
        {
            // Arrange
            var expectedBetStatus = "1FL:1-2;";
            var goalRecordModel = new GoalRecordModel
            {
                IsExistHtFgLg = true,
                FirstGoal = "1",
                LastGoal = "2"
            };

            goalRecordService.GoalRecordWithSemicolon(Arg.Any<GoalRecordModel>(), Arg.Any<string>()).Returns(goalRecordModel);

            // Act
            var actualBetStatus = service.BetStatusHasHalftimeScoreWithSemicolonOnGoalRecord(new SettleRequest { GoalRecord = ";" });

            // Assert
            Assert.Equal(expectedBetStatus, actualBetStatus);
        }

        [Fact]
        public void BetStatusWithIsNullHalftimeAndGoalRecord_ReturnsRightExpectedBetStatus()
        {
            // Arrange
            var expectedBetStatus = "1FL:0-0;";

            // Act
            var actualBetStatus = service.NoGoalHalftime;

            // Assert
            Assert.Equal(expectedBetStatus, actualBetStatus);
        }
    }
}