using Newtonsoft.Json;
using NSubstitute;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.HalfTimeBetStatus;
using Xunit;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.HalftimeBetStatus
{
    public class HalftimeServiceTests
    {
        private readonly IValidationService validationService;

        private readonly IHalftimeScoreAndGoalService halftimeScoreAndGoalService;

        private readonly IHalftimeService service;

        public HalftimeServiceTests()
        {
            validationService = Substitute.For<IValidationService>();
            halftimeScoreAndGoalService = Substitute.For<IHalftimeScoreAndGoalService>();
            service = new HalftimeServiceImp(validationService, halftimeScoreAndGoalService);
        }

        [Fact]
        public void GetBetStatusForCalculateHalfTime_HasGoalWithSemicolon_CallBetStatusHasHalftimeScoreWithSemicolonOnGoalRecordMethod()
        {
            // Arrange
            validationService.HasHalftimeScoreWithSemicolonOnGoalRecord(Arg.Any<SettleRequest>()).Returns(true);

            // Act
            service.GetBetStatusForCalculateHalfTime(Arg.Any<SettleRequest>());

            // Assert
            halftimeScoreAndGoalService.Received().BetStatusHasHalftimeScoreWithSemicolonOnGoalRecord(Arg.Any<SettleRequest>());
        }

        [Fact]
        public void GetBetStatusForCalculateHalfTime_IsNoGoal_ReturnsRightBetStatusFromNoGoalHalftime()
        {
            // Arrange
            var goalRecord = new GoalRecordModel
            {
                IsExistHtFgLg = true,
                FirstGoal = "0",
                LastGoal = "0"
            };

            var expectedBetStatus = goalRecord.HalftimeBetStatus;

            validationService.IsNullHalftimeScoreAndGoalRecord(Arg.Any<SettleRequest>()).Returns(true);
            halftimeScoreAndGoalService.NoGoalHalftime.Returns("1FL:0-0;");

            // Act
            var actualBetStatus = service.GetBetStatusForCalculateHalfTime(new SettleRequest());

            // Assert
            Assert.Equal(expectedBetStatus, actualBetStatus);
        }

        [Fact]
        public void GetBetStatusForCalculateHalfTime_HasGoalWithoutSemicolon_CallBetStatusHasHalftimeScoreWithoutSemicolonOnGoalRecordMethod()
        {
            // Arrange
            validationService.HasHalftimeScoreWithoutSemicolonOnGoalRecord(Arg.Any<SettleRequest>()).Returns(true);

            // Act
            service.GetBetStatusForCalculateHalfTime(Arg.Any<SettleRequest>());

            // Assert
            halftimeScoreAndGoalService.Received().BetStatusHasHalftimeScoreWithoutSemicolonOnGoalRecord(Arg.Any<SettleRequest>());
        }

        [Fact]
        public void GetBetStatusForCalculateHalfTime_ReturnsEmptyBetStatus()
        {
            // Act
            var actualBetStatus = service.GetBetStatusForCalculateHalfTime(Arg.Any<SettleRequest>());

            // Assert
            Assert.Empty(actualBetStatus);
        }

        [Fact]
        public void ApplyNewBetStatusForHalfTime_EmptyBetStatus_ReturnsDefaultHalftimeBetStatus()
        {
            // Arrange
            var halftimeBetStatus = "1FL:1-0;";

            // Act
            var actualBetStatus = service.ApplyNewBetStatusForHalfTime(string.Empty, halftimeBetStatus);

            // Assert
            Assert.Equal(halftimeBetStatus, actualBetStatus);
        }

        [Fact]
        public void ApplyNewBetStatusForHalfTime_NotEmptyBetStatus_ReturnsHalftimeBetStatusPlusOldBetStatus()
        {
            // Arrange
            var oldBetStatus = "FL:1-0;";
            var halftimeBetStatus = "1FL:1-0;";
            var expectedBetStatus = "1FL:1-0;FL:1-0;";

            // Act
            var actualBetStatus = service.ApplyNewBetStatusForHalfTime(oldBetStatus, halftimeBetStatus);

            // Assert
            Assert.Equal(expectedBetStatus, actualBetStatus);
        }

        [Fact]
        public void ApplyNewBetStatusForHalfTime_Exist1FLOnBetStatus_CallHasFirstGoalOnBetStatusMethodOfHalftimeScoreAndGoalService()
        {
            // Arrange
            var oldBetStatus = "1FL:1-0;";

            // Act
            service.ApplyNewBetStatusForHalfTime(oldBetStatus, string.Empty);

            // Assert
            halftimeScoreAndGoalService.Received().HasFirstGoalOnBetStatus(Arg.Any<string>(), Arg.Any<string>());
        }
    }
}