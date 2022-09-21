using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Services.InstantCalculate;
using Xunit;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.Instant
{
    public class InstantGoalCheckingServiceTests
    {
        private readonly IInstantGoalCheckingService service;

        public InstantGoalCheckingServiceTests()
        {
            service = new InstantGoalCheckingServiceImp();
        }

        [Theory]
        [InlineData("AH;H", "A")]
        [InlineData("", "")]
        public void IsHalftimeGoalChecking_TheSameNewFirstGoalWithOldFirstGoalValue_ReturnsFalse(string newGoal, string oldGoal)
        {
            // Arrange
            var goalCondition = new InstantGoalCondition
            {
                IsHalfTime = true,
                GoalRecord = "A;AHH",
                FirstGoalValue = "A"
            };

            // Act
            var actual = service.IsHalftimeGoalChecking(goalCondition);

            // Assert
            Assert.False(actual);
        }

        [Theory]
        [InlineData("AH;H", "H")]
        [InlineData(";H", "H")]
        [InlineData("", "A")]
        [InlineData("AH;H", "")]
        public void IsHalftimeGoalChecking_DifferentGoalBetweenNewAndOldFirstGoal_ReturnsTrue(string newGoal, string oldGoal)
        {
            // Arrange
            var goalCondition = new InstantGoalCondition
            {
                IsHalfTime = true,
                GoalRecord = newGoal,
                FirstGoalValue = oldGoal
            };

            // Act
            var actual = service.IsHalftimeGoalChecking(goalCondition);

            // Assert
            Assert.True(actual);
        }

        [Theory]
        [InlineData("", "")]
        [InlineData(";", "")]
        [InlineData(";AHH", "A")]
        [InlineData("A;AHH", "A")]
        public void IsFullTimeGoallChecking_TheSameNewFirstGoalWithOldFirstGoalValue_ReturnsFalse(string newGoal, string oldGoal)
        {
            // Arrange
            var goalCondition = new InstantGoalCondition
            {
                IsHalfTime = false,
                GoalRecord = newGoal,
                FirstGoalValue = oldGoal
            };

            // Act
            var actual = service.IsFullTimeGoallChecking(goalCondition);

            // Assert
            Assert.False(actual);
        }

        [Theory]
        [InlineData("AH;H", "H")]
        [InlineData(";A", "H")]
        [InlineData(";", "A")]
        public void IsFullTimeGoallChecking_DifferentGoalBetweenNewAndOldFirstGoal_ReturnsTrue(string newGoal, string oldGoal)
        {
            // Arrange
            var goalCondition = new InstantGoalCondition
            {
                IsHalfTime = false,
                GoalRecord = newGoal,
                FirstGoalValue = oldGoal
            };

            // Act
            var actual = service.IsFullTimeGoallChecking(goalCondition);

            // Assert
            Assert.True(actual);
        }
    }
}