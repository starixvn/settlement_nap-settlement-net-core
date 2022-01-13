using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Services;
using Xunit;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services
{
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
            var expectedGoal = "FL:0-0;";

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
            Assert.Equal(JsonConvert.SerializeObject(expectedGoal), JsonConvert.SerializeObject(actualGoal)); ;
        }
    }
}