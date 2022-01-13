using NSubstitute;
using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus;
using Xunit;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.FullTimeBetStatus
{
    public class HalftimeFullTimeServiceTests
    {
        private readonly IGoalRecordService goalRecordService;

        private readonly IFullTimeService fullTimeService;

        private readonly IHalftimeFullTimeService service;

        public HalftimeFullTimeServiceTests()
        {
            goalRecordService = Substitute.For<IGoalRecordService>();
            fullTimeService = Substitute.For<IFullTimeService>();
            service = new HalftimeFullTimeServiceImp(goalRecordService, fullTimeService);
        }

        [Theory]
        [InlineData(";", "1FL:1-1", "1FL:0-0;")]
        [InlineData("", "refund ht;1FL:1-1;", "Refund HT;1FL:0-0;")]
        public void HalfTimeBetStatus_ReturnRightBetStatus(string goalRecordRequest, string betStatus, string expected)
        {
            // Arrange
            var request = new SettleRequest { GoalRecord = goalRecordRequest, BetStatus = betStatus };
            var goalRecord = new GoalRecordModel { IsExistHtFgLg = true, FirstGoal = "0", LastGoal = "0" };
            goalRecordService.GoalRecordWithSemicolon(Arg.Any<GoalRecordModel>(), Arg.Any<string>()).Returns(goalRecord);

            // Act
            var actual = service.HalfTimeBetStatus(request);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        public void FullTimeBetStatus_IsExistRefundHT_InvokeBetStatusMethodOfFullTimeService()
        {
            // Arrange
            var query = new SettleRequest { BetStatus = EventStatus.RefundHT };
            fullTimeService.IsExistRefundHt(Arg.Any<bool>(), Arg.Any<string>()).Returns(true);

            // Act
            service.FullTimeBetStatus(query, string.Empty);

            // Assert
            fullTimeService.Received().RefundHtOnBetStatus(Arg.Any<string>());
        }

        [Fact]
        public void FullTimeBetStatus_NotExistRefundHT_ReturnRightBetStatus()
        {
            // Arrange
            var expected = "Refund HT;FL:0-0;";
            var query = new SettleRequest();
            fullTimeService.IsExistRefundHt(Arg.Any<bool>(), Arg.Any<string>()).Returns(false);
            fullTimeService.BetStatusFullTimeWithSemicolon(Arg.Any<SettleRequest>()).Returns("Refund HT;FL:0-0;");

            // Act
            var actual = service.FullTimeBetStatus(query, string.Empty);

            // Assert
            Assert.Equal(expected, actual);
        }
    }
}