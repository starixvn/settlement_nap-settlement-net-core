using NSubstitute;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus;
using Xunit;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.FullTimeBetStatus
{
    public class ScoreAndGoalServiceTests
    {
        private readonly IHalftimeFullTimeService halftimeFullTimeService;
        private readonly IFirstGoalLastGoalService firstGoalLastGoalService;
        private readonly IScoreAndGoalService service;

        public ScoreAndGoalServiceTests()
        {
            halftimeFullTimeService = Substitute.For<IHalftimeFullTimeService>();
            firstGoalLastGoalService = Substitute.For<IFirstGoalLastGoalService>();
            service = new ScoreAndGoalServiceImp(halftimeFullTimeService, firstGoalLastGoalService);
        }

        [Fact]
        public void ReplaceBetStatusWhenScoreAndGoalRecordIsNull_Has1FLOnBetStatus_InvokeFirstGoalOnBetStatusMethodOfFirstGoalLastGoalService()
        {
            // Arrange
            var betStatus = "1FL:1-1";

            // Act
            service.ReplaceBetStatusWhenScoreAndGoalRecordIsNull(betStatus);

            // Assert
            firstGoalLastGoalService.Received().FirstGoalOnBetStatus(Arg.Any<string>());
        }

        [Fact]
        public void ReplaceBetStatusWhenScoreAndGoalRecordIsNull_Not1FLOnBetStatus_InvokeLastGoalOnBetStatusMethodOfFirstGoalLastGoalService()
        {
            // Arrange
            var betStatus = "FL:1-1";

            // Act
            service.ReplaceBetStatusWhenScoreAndGoalRecordIsNull(betStatus);

            // Assert
            firstGoalLastGoalService.Received().LastGoalOnBetStatus(Arg.Any<string>());
        }

        [Fact]
        public void BetStatusHasFinalScoreAndGoalRecord_ExistHtFgLg_InvokeHalfTimeBetStatusMethodOfHalftimeFullTimeService()
        {
            // Arrange
            var query = new SettleRequest { IsExistHtFgLg = true };

            // Act
            service.BetStatusHasFinalScoreAndGoalRecord(query);

            // Assert
            halftimeFullTimeService.Received().HalfTimeBetStatus(Arg.Any<SettleRequest>());
        }

        [Fact]
        public void BetStatusHasFinalScoreAndGoalRecord_ExistFgLg_InvokeFullTimeBetStatusMethodOfHalftimeFullTimeService()
        {
            // Arrange
            var query = new SettleRequest { IsExistFgLg = true };

            // Act
            service.BetStatusHasFinalScoreAndGoalRecord(query);

            // Assert
            halftimeFullTimeService.Received().FullTimeBetStatus(Arg.Any<SettleRequest>(), Arg.Any<string>());
        }

        [Fact]
        public void BetStatusHasFinalScoreAndGoalRecord_NotExistHtFgLgAndNotExistFgLg_ReturnEmpty()
        {
            // Act
            var actual = service.BetStatusHasFinalScoreAndGoalRecord(new SettleRequest());

            // Assert
            Assert.Empty(actual);
        }
    }
}