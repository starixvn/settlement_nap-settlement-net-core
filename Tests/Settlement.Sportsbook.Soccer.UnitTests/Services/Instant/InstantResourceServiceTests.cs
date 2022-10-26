using Newtonsoft.Json;
using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.InstantCalculate;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.Instant
{
    public class InstantResourceServiceFacts
    {
        private readonly IInstantGoalCheckingService instantGoalCheckingService;

        private readonly IGoalRecordService goalRecordService;

        private readonly XmlConvertService xmlConvertService;

        private readonly IInstantResourceService service;

        public InstantResourceServiceFacts()
        {
            instantGoalCheckingService = Substitute.For<IInstantGoalCheckingService>();
            goalRecordService = Substitute.For<IGoalRecordService>();
            xmlConvertService = Substitute.For<XmlConvertService>();
            service = new InstantResourceServiceImp(instantGoalCheckingService, goalRecordService, xmlConvertService);
        }

        [Fact]
        public void Halftime_IsExistHtFgNgIsTrue_ReturnExpect()
        {
            // Arrange
            var goalCondition = new InstantGoalCondition
            {
                IsExistHtFgNg = true
            };

            var expect = new List<XmlResource>
            {
                new XmlResource
                {
                     ResourceId = ResourceKey.HalftimeFirstGoal,
                     ResultStatusId = ResultStatus.ManuallySettled,
                     SettlementStatusId =SettlementStatus.Completed,
                     HomeValue = "A"
                }
            };

            // Act
            goalRecordService.FirstGoalRecord(Arg.Any<string>(), Arg.Any<bool>()).Returns("A");
            var actual = service.Halftime(goalCondition);

            // Assert
            Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
        }

        [Fact]
        public void Halftime_IsExistFgNgIsTrue_ReturnExpect()
        {
            // Arrange
            var goalCondition = new InstantGoalCondition
            {
                IsExistFgNg = true,
            };

            var expect = new List<XmlResource>
            {
                new XmlResource
                {
                     ResourceId = ResourceKey.FullTimeFirstGoal,
                     ResultStatusId = ResultStatus.ManuallySettled,
                     SettlementStatusId =SettlementStatus.Completed,
                     HomeValue = "A"
                }
            };

            goalRecordService.FirstGoalRecord(Arg.Any<string>(), Arg.Any<bool>()).Returns("A");

            // Act
            var actual = service.Halftime(goalCondition);

            // Assert
            Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
        }

        [Fact]
        public void Halftime_IsExistFgNgIsTrueAndIsExistHtFgNgIsTrue_ReturnExpectLength2()
        {
            // Arrange
            var goalCondition = new InstantGoalCondition
            {
                IsExistFgNg = true,
                IsExistHtFgNg = true
            };

            goalRecordService.FirstGoalRecord(Arg.Any<string>(), Arg.Any<bool>()).Returns("A");

            // Act
            var actual = service.Halftime(goalCondition);

            // Assert
            Assert.Equal(2, actual.Count);
        }

        [Fact]
        public void Halftime_IsExistFgNgIsFalseAndIsExistHtFgNgIsFalse_ReturnEmptyOfList()
        {
            // Arrange
            var goalCondition = new InstantGoalCondition
            {
                IsExistFgNg = false,
                IsExistHtFgNg = false
            };

            goalRecordService.FirstGoalRecord(Arg.Any<string>(), Arg.Any<bool>()).Returns("A");

            // Act
            var actual = service.Halftime(goalCondition);

            // Assert
            Assert.Empty(actual);
        }

        [Fact]
        public void FullTime_IsExistFgNgIsTrue_ReturnExpect()
        {
            // Arrange
            var goalCondition = new InstantGoalCondition
            {
                IsExistFgNg = true
            };

            var expect = new List<XmlResource>
            {
                new XmlResource
                {
                     ResourceId = ResourceKey.FullTimeFirstGoal,
                     ResultStatusId = ResultStatus.ManuallySettled,
                     SettlementStatusId =SettlementStatus.Completed,
                     HomeValue = "A"
                }
            };

            goalRecordService.FirstGoalRecord(Arg.Any<string>(), Arg.Any<bool>()).Returns("A");

            // Act
            var actual = service.FullTime(goalCondition);

            // Assert
            Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
        }

        [Fact]
        public void FullTime_IsExistFgNgIsFalse_ReturnEmptyOfList()
        {
            // Arrange
            var goalCondition = new InstantGoalCondition
            {
                IsExistFgNg = false,
            };

            // Act
            var actual = service.FullTime(goalCondition);

            // Assert
            Assert.Empty(actual);
        }

        [Fact]
        public void UnCalculate_IsExistHtFgLgIsTrueAndIsExistHtFgNgIsFalse_ReturnExpect()
        {
            // Arrange
            var goalCondition = new InstantGoalCondition
            {
                IsExistHtFgLg = true,
                IsExistHtFgNg = false,
            };

            var expect = new List<XmlResource>
            {
                new XmlResource
                {
                    ResourceId = ResourceKey.HalftimeFirstGoal,
                    ResultStatusId = ResultStatus.Initial,
                    SettlementStatusId = SettlementStatus.Running,
                    HomeValue = string.Empty
                }
            };

            // Act
            instantGoalCheckingService.IsHalftimeGoalChecking(Arg.Any<InstantGoalCondition>()).Returns(false);
            var actual = service.UnCalculate(goalCondition);

            // Assert
            Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
        }

        [Fact]
        public void UnCalculate_IsHalftimeGoalCheckingIsTrue_ReturnExpect()
        {
            // Arrange
            var goalCondition = new InstantGoalCondition();

            var expect = new List<XmlResource>
            {
                new XmlResource
                {
                    ResourceId = ResourceKey.HalftimeFirstGoal,
                    ResultStatusId = ResultStatus.Initial,
                    SettlementStatusId = SettlementStatus.Running,
                    HomeValue = string.Empty
                }
            };

            // Act
            instantGoalCheckingService.IsHalftimeGoalChecking(Arg.Any<InstantGoalCondition>()).Returns(true);
            var actual = service.UnCalculate(goalCondition);
            // Assert
            Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
        }

        [Fact]
        public void UnCalculate_IsExistFgLgIsTrueAndIsExistFgNgIsFalse_ReturnExpect()
        {
            // Arrange
            var goalCondition = new InstantGoalCondition
            {
                IsExistFgLg = true,
                IsExistFgNg = false,
            };

            var expect = new List<XmlResource>
            {
                new XmlResource
                {
                    ResourceId = ResourceKey.FullTimeFirstGoal,
                    ResultStatusId = ResultStatus.Initial,
                    SettlementStatusId = SettlementStatus.Running,
                    HomeValue = string.Empty
                }
            };

            // Act
            instantGoalCheckingService.IsHalftimeGoalChecking(Arg.Any<InstantGoalCondition>()).Returns(false);
            var actual = service.UnCalculate(goalCondition);

            // Assert
            Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
        }

        [Fact]
        public void UnCalculate_IsFullTimeGoallCheckingIsTrue_ReturnExpect()
        {
            // Arrange
            var goalCondition = new InstantGoalCondition();

            var expect = new List<XmlResource>
            {
                new XmlResource
                {
                    ResourceId = ResourceKey.FullTimeFirstGoal,
                    ResultStatusId = ResultStatus.Initial,
                    SettlementStatusId = SettlementStatus.Running,
                    HomeValue = string.Empty
                }
            };

            // Act
            instantGoalCheckingService.IsFullTimeGoallChecking(Arg.Any<InstantGoalCondition>()).Returns(true);
            var actual = service.UnCalculate(goalCondition);

            // Assert
            Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
        }

        [Fact]
        public void UnCalculate_IsFullTimeGoallCheckingIsTrueAndIsHalftimeGoalCheckingIsTrue_ReturnExpectLength2()
        {
            // Arrange
            var goalCondition = new InstantGoalCondition();

            // Act
            instantGoalCheckingService.IsHalftimeGoalChecking(Arg.Any<InstantGoalCondition>()).Returns(true);
            instantGoalCheckingService.IsFullTimeGoallChecking(Arg.Any<InstantGoalCondition>()).Returns(true);
            var actual = service.UnCalculate(goalCondition);

            // Assert
            Assert.Equal(2, actual.Count);
        }

        [Fact]
        public void UnCalculate_IsFullTimeGoallCheckingIsFalseAndIsHalftimeGoalCheckingIsFalse_ReturnEmptyOfList()
        {
            // Arrange
            var goalCondition = new InstantGoalCondition();

            // Act
            instantGoalCheckingService.IsHalftimeGoalChecking(Arg.Any<InstantGoalCondition>()).Returns(false);
            instantGoalCheckingService.IsFullTimeGoallChecking(Arg.Any<InstantGoalCondition>()).Returns(false);
            var actual = service.UnCalculate(goalCondition);

            // Assert
            Assert.Empty(actual);
        }

        [Theory]
        [InlineData(false, "H;", "", "")]
        [InlineData(true, "H;", "", "FL:1-0;")]
        [InlineData(true, "H;", "1FL:2-0;", "FL:1-0;")]
        [InlineData(true, "A;", "1FL:1-0;", "FL:2-0;")]
        [InlineData(true, "A;", "FL:1-0;", "")]
        public void BetStatusFl_Always_ReturnBetStatus(bool isExistFg, string goalRecord, string betStatus, string expected)
        {
            //arrange
            var request = new InstantCalculationRequest
            {
                IsExistFG = isExistFg,
                GoalRecord = goalRecord
            };

            //act
            var actual = service.BetStatusFl(request, betStatus);

            //assert
            Assert.Equal(expected, actual);
        }

        [Theory]
        [InlineData(false, "H;", "", "")]
        [InlineData(true, ";H", "", "")]
        [InlineData(true, "A;", "", "1FL:2-0;")]
        [InlineData(true, "A;", "1FL:1-0;", "")]
        [InlineData(true, "A;", "FL:1-0;", "1FL:2-0;")]
        [InlineData(true, "H;", "FL:1-0;", "1FL:1-0;")]
        public void BetStatusHtFl_Always_ReturnBetStatus(bool isExistHTFG, string goalRecord, string betStatus, string expected)
        {
            //arrange
            var request = new InstantCalculationRequest
            {
                IsExistHTFG = isExistHTFG,
                GoalRecord = goalRecord
            };

            //act
            var actual = service.BetStatusHtFl(request, betStatus);

            //assert
            Assert.Equal(expected, actual);
        }

        [Theory]
        [InlineData("", true, true, "")]
        [InlineData("1FL:2-0;", true, true, "")]
        [InlineData("FL:2-0;", true, true, "")]
        [InlineData("1FL:2-0;FL:2-0;", true, true, "")]
        [InlineData("1FL:2-0;FL:2-0;", false, false, "1FL:2-0;FL:2-0;")]
        public void RemoveBetStatus_Always_RemoveBetStatus(string betStatus, bool isExistHTFG, bool isExistFG, string expected)
        {
            //arrange
            var request = new InstantCalculationRequest
            {
                BetStatus = betStatus,
                IsExistHTFG = isExistHTFG,
                IsExistFG = isExistFG
            };

            //act
            var actual = service.RemoveBetStatus(request);

            //assert
            Assert.Equal(expected, actual);
        }
    }
}