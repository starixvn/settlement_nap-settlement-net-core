using Newtonsoft.Json;
using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.InstantCalculate;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.Instant;

public class InstantResourceServiceTests
{
    private readonly IInstantGoalCheckingService instantGoalCheckingService;

    private readonly IGoalRecordService goalRecordService;

    private readonly InstantResourceService service;

    private readonly XmlConvertService xmlConvertService;

    public InstantResourceServiceTests()
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
            new()
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
            IsExistFgNg = true
        };

        var expect = new List<XmlResource>
        {
            new()
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
    public void Halftime_IsExistHTFirstCornerIsTrue_ReturnCorrect()
    {
        // Arrange
        var goalCondition = new InstantGoalCondition
        {
            IsExistHTFirstCorner = true
        };
        var expect = new List<XmlResource>
        {
          new ()
          {
              ResourceId = ResourceKey.HaftTimeFirstCorner,
              ResultStatusId = ResultStatus.ManuallySettled,
              SettlementStatusId = SettlementStatus.Completed,
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
    public void Halftime_IsExistFirstCornerIsTrue_ReturnCorrect()
    {
        // Arrange
        var goalCondition = new InstantGoalCondition
        {
            IsExistFirstCorner = true
        };
        var expect = new List<XmlResource>
        {
          new ()
          {
              ResourceId = ResourceKey.FirstCorner,
              ResultStatusId = ResultStatus.ManuallySettled,
              SettlementStatusId = SettlementStatus.Completed,
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
    public void Halftime_IsExistHTCornerIsTrue_ReturnCorrect()
    {
        // Arrange
        var goalCondition = new InstantGoalCondition
        {
            IsExistHTCorner = true
        };
        var expect = new List<XmlResource>
        {
          new ()
          {
              ResourceId = "48701",
              ResultStatusId = ResultStatus.ManuallySettled,
              SettlementStatusId = SettlementStatus.Completed,
              HomeValue = "A"
          }
        };

        goalRecordService.HalftimeGoal(Arg.Any<string>()).Returns("A");

        // Act
        var actual = service.Halftime(goalCondition);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void Halftime_IsExistCornerIsTrue_ReturnCorrect()
    {
        // Arrange
        var goalCondition = new InstantGoalCondition
        {
            IsExistCorner = true,
            GoalRecord = "A"
        };
        var expect = new List<XmlResource>
        {
          new ()
          {
              ResourceId = "48601",
              ResultStatusId = ResultStatus.ManuallySettled,
              SettlementStatusId = SettlementStatus.Completed,
              HomeValue = "A"
          }
        };

        goalRecordService.HalftimeGoal(Arg.Any<string>()).Returns("A");

        // Act
        var actual = service.Halftime(goalCondition);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
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
            new()
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
            IsExistFgNg = false
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
            IsExistHtFgNg = false
        };

        var expect = new List<XmlResource>
        {
            new()
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
            new()
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
            IsExistFgNg = false
        };

        var expect = new List<XmlResource>
        {
            new()
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
    public void UnCalculate_IsFullTimeGoalCheckingIsTrue_ReturnExpect()
    {
        // Arrange
        var goalCondition = new InstantGoalCondition();

        var expect = new List<XmlResource>
        {
            new()
            {
                ResourceId = ResourceKey.FullTimeFirstGoal,
                ResultStatusId = ResultStatus.Initial,
                SettlementStatusId = SettlementStatus.Running,
                HomeValue = string.Empty
            }
        };

        // Act
        instantGoalCheckingService.IsFullTimeGoalChecking(Arg.Any<InstantGoalCondition>()).Returns(true);
        var actual = service.UnCalculate(goalCondition);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void UnCalculate_IsFullTimeGoalCheckingIsTrueAndIsHalftimeGoalCheckingIsTrue_ReturnExpectLength2()
    {
        // Arrange
        var goalCondition = new InstantGoalCondition();

        // Act
        instantGoalCheckingService.IsHalftimeGoalChecking(Arg.Any<InstantGoalCondition>()).Returns(true);
        instantGoalCheckingService.IsFullTimeGoalChecking(Arg.Any<InstantGoalCondition>()).Returns(true);
        var actual = service.UnCalculate(goalCondition);

        // Assert
        Assert.Equal(2, actual.Count);
    }

    [Fact]
    public void UnCalculate_IsFullTimeGoalCheckingIsFalseAndIsHalftimeGoalCheckingIsFalse_ReturnEmptyOfList()
    {
        // Arrange
        var goalCondition = new InstantGoalCondition();

        // Act
        instantGoalCheckingService.IsHalftimeGoalChecking(Arg.Any<InstantGoalCondition>()).Returns(false);
        instantGoalCheckingService.IsFullTimeGoalChecking(Arg.Any<InstantGoalCondition>()).Returns(false);
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
    public void BetStatusHtFl_Always_ReturnBetStatus(bool isExistHtfg, string goalRecord, string betStatus, string expected)
    {
        //arrange
        var request = new InstantCalculationRequest
        {
            IsExistHTFG = isExistHtfg,
            GoalRecord = goalRecord
        };

        //act
        var actual = service.BetStatusHtFl(request, betStatus);

        //assert
        Assert.Equal(expected, actual);
    }

    [Theory]
    [InlineData("", true, true, "")]
    [InlineData("FL:2-0;", true, true, "")]
    [InlineData("1FL:2-0;FL:2-0;", true, true, "1FL:2-0;")]
    [InlineData("1FL:2-0;FL:2-0;", false, false, "1FL:2-0;FL:2-0;")]
    public void RemoveBetStatus_Always_RemoveBetStatus(string betStatus, bool isExistHtfg, bool isExistFg, string expected)
    {
        //arrange
        var request = new InstantCalculationRequest
        {
            BetStatus = betStatus,
            IsExistHTFG = isExistHtfg,
            IsExistFG = isExistFg
        };

        //act
        var actual = service.RemoveBetStatus(request);

        //assert
        Assert.Equal(expected, actual);
    }

    [Fact]
    public void GenerateResource_ResourcesListIsEmpty_ReturnsEmptyString()
    {
        // Arrange
        var resources = new List<XmlResource>();

        // Act
        var result = service.GenerateResource(resources);

        // Assert
        Assert.Equal(string.Empty, result);
    }

    [Fact]
    public void GenerateResource_ResourcesListIsNotEmpty_ReturnsSerializedString()
    {
        // Arrange
        var resources = new List<XmlResource>
        {
            new()
            {
                ResourceId = ResourceKey.FullTimeFirstGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId =SettlementStatus.Completed,
                HomeValue = "A"
            }
        };
        const string expectedSerializedString = "<XmlResults><Resources><XmlResource /></Resources></XmlResults>";
        xmlConvertService.Serialize(Arg.Any<XmlResults>()).Returns(expectedSerializedString);

        // Act
        var result = service.GenerateResource(resources);

        // Assert
        Assert.Equal(expectedSerializedString, result);
    }
}