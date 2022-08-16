using Settlement.Sportsbook.Soccer.Services;
using System.Collections.Generic;
using Newtonsoft.Json;
using NSubstitute;
using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Models;
using Xunit;
using Settlement.Sportsbook.Soccer.Services.InstantCalculate;

namespace Settlement.Sportsbook.Soccer.UnitFacts.Services
{
    public class InstantResourceServiceFacts
    {
        private readonly IInstantGoalCheckingService instantGoalCheckingService;

        private readonly IGoalRecordService goalRecordService;

        private readonly IInstantResourceService service;

        public InstantResourceServiceFacts()
        {
            instantGoalCheckingService = Substitute.For<IInstantGoalCheckingService>();
            goalRecordService = Substitute.For<IGoalRecordService>();
            service = new InstantResourceServiceImp(instantGoalCheckingService, goalRecordService);
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
    }
}