using NSubstitute;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus;
using Xunit;
using FirstGoalLastGoalServiceImp = Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus.FirstGoalLastGoalServiceImp;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.FullTimeBetStatus
{
    public class FullTimeServiceTests
    {
        private readonly IGoalRecordService goalRecordService;

        private readonly IFullTimeService service;

        public FullTimeServiceTests()
        {
            goalRecordService = Substitute.For<IGoalRecordService>();

            service = new FullTimeServiceImp(goalRecordService);
        }

        [Fact]
        public void BetStatusFullTimeWithSemicolon_IsExistFgLg_ReturnRightBetStatus()
        {
            // Arrange
            var expected = "FL:0-0;";
            var goalRecord = new GoalRecordModel { IsExistFgLg = true, FirstGoal = "0", LastGoal = "0" };
            goalRecordService.GoalRecordWithSemicolon(Arg.Any<GoalRecordModel>(), Arg.Any<string>()).Returns(goalRecord);

            // Act
            var actual = service.BetStatusFullTimeWithSemicolon(new SettleRequest { GoalRecord = ";" });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Theory]
        [InlineData(true, "refund ht", false)]
        [InlineData(false, "refund ht", false)]
        [InlineData(false, "refund", false)]
        [InlineData(true, "refund", true)]
        public void IsExistRefundHT_ReturnsRightExpected(bool isExistRefundHt, string halfTimeBetStatus, bool expected)
        {
            // Act
            var actual = service.IsExistRefundHt(isExistRefundHt, halfTimeBetStatus);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        public void RefundHTOnBetStatus_Always_ReturnsRefundHalftimeOnBetStatus()
        {
            // Arrange
            var fullTimeBetStatus = "FL:0-0;";
            var expected = "Refund HT;FL:0-0;";

            // Act
            var actual = service.RefundHtOnBetStatus(fullTimeBetStatus);

            // Assert
            Assert.Equal(expected, actual);
        }
    }
}