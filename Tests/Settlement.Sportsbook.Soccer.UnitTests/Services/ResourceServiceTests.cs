using AutoMapper;
using Newtonsoft.Json;
using Settlement.Constants;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Services;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services;

public class ResourceServiceTests
{
    private readonly IActionResourceService actionResourceService;

    private readonly IGoalRecordService goalRecordService;

    private readonly IResourceService service;

    public ResourceServiceTests()
    {
        goalRecordService = Substitute.For<IGoalRecordService>();
        actionResourceService = Substitute.For<IActionResourceService>();
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SoccerAutoMapperProfile>();
        service = new ResourceServiceImp(actionResourceService, goalRecordService);
    }

    [Fact]
    public void HalftimeResources_IsExistHtFgLgIsTrue_CallRightMethod()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistHtFgLg = true
        };

        // Act

        service.HalftimeResources(goalCondition, SettlementStatus.Completed);

        // Assert
        actionResourceService.Received().HalftimeResources(Arg.Any<GoalAction>());
    }

    [Fact]
    public void HalftimeResources_IsExistHtFgLgIsFalse_ReturnExpect()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistHtFgLg = false
        };

        // Act
        var actual = service.HalftimeResources(goalCondition, SettlementStatus.Completed);

        // Assert
        actionResourceService.DidNotReceive().HalftimeResources(Arg.Any<GoalAction>());

        Assert.Empty(actual);
    }

    [Fact]
    public void HalftimeResources_IsExistHtFgLgIsTrueAndIsEnabledGoalRecordHtIsTrue_returnExpect()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistHtFgLg = true,
            IsEnabledGoalRecordHt = true
        };

        var expect = new List<XmlResource>
        {
            new()
            {
                HomeValue="H",
                ResourceId=ResourceKey.HalftimeFirstGoal,
                ResultStatusId=ResultStatus.ManuallySettled,
                SettlementStatusId=SettlementStatus.Completed
            },
            new()
            {
                HomeValue="A",
                ResourceId=ResourceKey.HalftimeLastGoal,
                ResultStatusId=ResultStatus.ManuallySettled,
                SettlementStatusId=SettlementStatus.Completed
            },
            new()
            {
                HomeValue = "H",
                ResourceId = ResourceKey.HalftimeLastGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Completed
            }
        };

        actionResourceService.HalftimeResources(Arg.Any<GoalAction>()).Returns([
            new XmlResource
            {
                HomeValue = "H",
                ResourceId = ResourceKey.HalftimeFirstGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Completed
            },

            new XmlResource
            {
                HomeValue = "A",
                ResourceId = ResourceKey.HalftimeLastGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Completed
            }
        ]);

        actionResourceService.HalftimeGoalRecord(Arg.Any<string>(), Arg.Any<int>()).Returns(new XmlResource
        {
            HomeValue = "H",
            ResourceId = ResourceKey.HalftimeLastGoal,
            ResultStatusId = ResultStatus.ManuallySettled,
            SettlementStatusId = SettlementStatus.Completed
        });

        // Act

        var actual = service.HalftimeResources(goalCondition, SettlementStatus.Completed);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void HalftimeResources_IsExistHtFgLgIsFalseAndIsEnabledGoalRecordHtIsTrue_returnExpect()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistHtFgLg = false,
            IsEnabledGoalRecordHt = true
        };

        var expect = new List<XmlResource>
        {
            new()
            {
                HomeValue = "H",
                ResourceId = ResourceKey.HalftimeLastGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Completed
            }
        };

        actionResourceService.HalftimeGoalRecord(Arg.Any<string>(), Arg.Any<int>()).Returns(new XmlResource
        {
            HomeValue = "H",
            ResourceId = ResourceKey.HalftimeLastGoal,
            ResultStatusId = ResultStatus.ManuallySettled,
            SettlementStatusId = SettlementStatus.Completed
        });

        // Act

        var actual = service.HalftimeResources(goalCondition, SettlementStatus.Completed);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void HalftimeResources_IsExistHtFgLgIsFalseAndIsEnabledGoalRecordHtIsFalse_returnEmpty()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistHtFgLg = false,
            IsEnabledGoalRecordHt = false
        };

        // Act

        var actual = service.HalftimeResources(goalCondition, SettlementStatus.Completed);

        Assert.Empty(actual);
    }

    [Fact]
    public void FullTimeResources_IsExistFgLgIsTrue_CallRightMethod()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistFgLg = true
        };

        // Act

        service.FullTimeResources(goalCondition, SettlementStatus.Completed);

        actionResourceService.Received().FullTimeResources(Arg.Any<GoalAction>());
    }

    [Fact]
    public void FullTimeResources_IsExistFgLgIsFalse_ReturnExpect()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistHtFgLg = false
        };

        // Act

        var actual = service.FullTimeResources(goalCondition, SettlementStatus.Completed);

        // Assert
        actionResourceService.DidNotReceive().FullTimeResources(Arg.Any<GoalAction>());

        Assert.Empty(actual);
    }

    [Fact]
    public void FullTimeResources_IsExistFgLgIsTrueAndIsEnabledGoalRecordFtIsTrue_returnExpect()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistFgLg = true,
            IsEnabledGoalRecordFt = true
        };

        var expect = new List<XmlResource>
        {
            new()
            {
                HomeValue="H",
                ResourceId=ResourceKey.FullTimeFirstGoal,
                ResultStatusId=ResultStatus.ManuallySettled,
                SettlementStatusId=SettlementStatus.Completed
            },
            new()
            {
                HomeValue="A",
                ResourceId=ResourceKey.FullTimeLastGoal,
                ResultStatusId=ResultStatus.ManuallySettled,
                SettlementStatusId=SettlementStatus.Completed
            },
            new()
            {
                HomeValue = "H",
                ResourceId = ResourceKey.FullTimeFirstGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Completed
            }
        };

        actionResourceService.FullTimeResources(Arg.Any<GoalAction>()).Returns([
            new XmlResource
            {
                HomeValue = "H",
                ResourceId = ResourceKey.FullTimeFirstGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Completed
            },

            new XmlResource
            {
                HomeValue = "A",
                ResourceId = ResourceKey.FullTimeLastGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Completed
            }
        ]);

        actionResourceService.FullTimeGoalRecord(Arg.Any<string>(), Arg.Any<int>()).Returns(new XmlResource
        {
            HomeValue = "H",
            ResourceId = ResourceKey.FullTimeFirstGoal,
            ResultStatusId = ResultStatus.ManuallySettled,
            SettlementStatusId = SettlementStatus.Completed
        });

        // Act

        var actual = service.FullTimeResources(goalCondition, SettlementStatus.Completed);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void FullTimeResources_IsExistFgLgIsFalseAndIsEnabledGoalRecordFtIsTrue_returnExpect()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistFgLg = false,
            IsEnabledGoalRecordFt = true
        };

        var expect = new List<XmlResource>
        {
            new()
            {
                HomeValue = "H",
                ResourceId = ResourceKey.FullTimeFirstGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Completed
            }
        };

        actionResourceService.FullTimeGoalRecord(Arg.Any<string>(), Arg.Any<int>()).Returns(new XmlResource
        {
            HomeValue = "H",
            ResourceId = ResourceKey.FullTimeFirstGoal,
            ResultStatusId = ResultStatus.ManuallySettled,
            SettlementStatusId = SettlementStatus.Completed
        });

        // Act

        var actual = service.FullTimeResources(goalCondition, SettlementStatus.Completed);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void HalftimeResources_IsExistFgLgIsFalseAndIsEnabledGoalRecordFtIsFalse_returnEmpty()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistHtFgLg = false,
            IsEnabledGoalRecordHt = false
        };

        // Act

        var actual = service.FullTimeResources(goalCondition, SettlementStatus.Completed);

        Assert.Empty(actual);
    }

    [Fact]
    public void FullTimeResourcesSettleDetermined_IsExistFgLgIsTrueAndGoalRecordIsNotNull_ArgumentExpect()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistFgLg = true,
            GoalRecord = "AHAH;HA"
        };

        var expect = new GoalAction
        {
            FirstGoal = "AHAHHA",
            LastGoal = string.Empty,
            FirstGoalSettlementStatusId = SettlementStatus.Completed,
            LastGoalSettlementStatusId = SettlementStatus.Abandoned2H
        };

        actionResourceService.FullTimeResources(Arg.Any<GoalAction>()).Returns([]);
        goalRecordService.HalftimeGoal(Arg.Is("AHAH;HA")).Returns("AHAH");
        goalRecordService.FullTimeGoal(Arg.Is("AHAH;HA")).Returns("HA");

        // Act

        service.FullTimeResourcesSettleDetermined(goalCondition);

        // Assert
        actionResourceService.Received().FullTimeResources(
            Arg.Is<GoalAction>(
                x =>
                    x.FirstGoalSettlementStatusId == expect.FirstGoalSettlementStatusId
                    && x.LastGoalSettlementStatusId == expect.LastGoalSettlementStatusId
                    && x.FirstGoal == expect.FirstGoal
                    && x.LastGoal == expect.LastGoal
            ));
    }

    [Fact]
    public void FullTimeResourcesSettleDetermined_IsExistFgLgIsFalseAndIsEnabledGoalRecordFtIsTrue_ArgumentExpect()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistFgLg = false,
            IsEnabledGoalRecordFt = true,
            GoalRecord = "AHAH;HA"
        };

        var expect = new List<XmlResource>
        {
            new()
            {
                HomeValue = "AHAH",
                ResourceId = ResourceKey.FullTimeGoalRecord,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Abandoned2H
            }
        };

        actionResourceService.FullTimeGoalRecord(Arg.Any<string>(), Arg.Any<int>()).Returns(
            new XmlResource
            {
                HomeValue = "AHAH",
                ResourceId = ResourceKey.FullTimeGoalRecord,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Abandoned2H
            });

        // Act

        var actual = service.FullTimeResourcesSettleDetermined(goalCondition);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void FullTimeResourcesSettleDetermined_IsExistFgLgIsTrueAndIsEnabledGoalRecordFtIsTrue_ReturnExpect()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistFgLg = true,
            IsEnabledGoalRecordFt = true,
            GoalRecord = "AHAH;AH"
        };

        actionResourceService.FullTimeResources(Arg.Any<GoalAction>()).Returns(
        [
            new XmlResource
            {
                ResourceId = ResourceKey.FullTimeFirstGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Completed,
                HomeValue = "A"
            },

            new XmlResource
            {
                ResourceId = ResourceKey.FullTimeLastGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Abandoned2H,
                HomeValue = "H"
            }
        ]);

        actionResourceService.FullTimeGoalRecord(Arg.Any<string>(), Arg.Any<int>()).Returns(
            new XmlResource
            {
                HomeValue = "AHAH",
                ResourceId = ResourceKey.FullTimeGoalRecord,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Abandoned2H
            });

        // Act

        var actual = service.FullTimeResourcesSettleDetermined(goalCondition);

        // Assert
        Assert.Equal(3, actual.Count);
    }

    [Fact]
    public void AllResources_IsExistFgLgIsTrue_CallRightMethod()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistFgLg = true,
            GoalRecord = "AHAH;HA"
        };

        actionResourceService.FullTimeResources(Arg.Any<GoalAction>()).Returns([]);

        // Act

        service.AllResources(goalCondition, 1);

        // Assert
        actionResourceService.Received().FullTimeResources(Arg.Any<GoalAction>());
        actionResourceService.DidNotReceive().HalftimeGoalRecord(Arg.Any<string>(), Arg.Any<int>());
        actionResourceService.DidNotReceive().FullTimeGoalRecord(Arg.Any<string>(), Arg.Any<int>());
    }

    [Fact]
    public void AllResources_IsEnabledGoalRecordHtIsTrue_CallRightMethod()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsEnabledGoalRecordHt = true
        };

        goalRecordService.HalftimeGoal(Arg.Any<string>()).Returns("H");
        actionResourceService.HalftimeGoalRecord(Arg.Any<string>(), Arg.Any<int>()).Returns(new XmlResource());

        // Act

        service.AllResources(goalCondition, 1);

        // Assert
        actionResourceService.Received().HalftimeGoalRecord(Arg.Any<string>(), Arg.Any<int>());
        actionResourceService.DidNotReceive().FullTimeResources(Arg.Any<GoalAction>());
        actionResourceService.DidNotReceive().FullTimeGoalRecord(Arg.Any<string>(), Arg.Any<int>());
    }

    [Fact]
    public void AllResources_IsEnabledGoalRecordFtIsTrue_CallRightMethodAsync()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsEnabledGoalRecordFt = true
        };

        actionResourceService.FullTimeGoalRecord(Arg.Any<string>(), Arg.Any<int>()).Returns(new XmlResource());

        // Act

        service.AllResources(goalCondition, 1);

        // Assert
        actionResourceService.Received().FullTimeGoalRecord(Arg.Any<string>(), Arg.Any<int>());
        actionResourceService.DidNotReceive().FullTimeResources(Arg.Any<GoalAction>());
        actionResourceService.DidNotReceive().HalftimeGoalRecord(Arg.Any<string>(), Arg.Any<int>());
    }

    [Fact]
    public void AllResources_IsExistFgLgIsTrueAndIsEnabledGoalRecordHtIsTrueAndIsEnabledGoalRecordFtIsTrue_ReturnExpect()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistFgLg = true,
            IsEnabledGoalRecordHt = true,
            IsEnabledGoalRecordFt = true
        };

        var expect = new List<XmlResource>
        {
            new()
            {
                HomeValue="AHHAHA",
                ResourceId = ResourceKey.FullTimeGoalRecord,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Abandoned2H
            },
            new()
            {
                HomeValue = "H",
                ResourceId = ResourceKey.HalftimeLastGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Completed
            },
            new()
            {
                HomeValue = "H",
                ResourceId = ResourceKey.FullTimeFirstGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Completed
            }
        };

        actionResourceService.FullTimeResources(Arg.Any<GoalAction>()).Returns(
        [
            new XmlResource
            {
                HomeValue = "AHHAHA",
                ResourceId = ResourceKey.FullTimeGoalRecord,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Abandoned2H
            }
        ]);

        actionResourceService.HalftimeGoalRecord(Arg.Any<string>(), Arg.Any<int>()).Returns(
            new XmlResource
            {
                HomeValue = "H",
                ResourceId = ResourceKey.HalftimeLastGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Completed
            });

        actionResourceService.FullTimeGoalRecord(Arg.Any<string>(), Arg.Any<int>()).Returns(
            new XmlResource
            {
                HomeValue = "H",
                ResourceId = ResourceKey.FullTimeFirstGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Completed
            });

        // Act

        var actual = service.AllResources(goalCondition, 1);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void AllResources_IsExistFgLgIsFalseAndIsEnabledGoalRecordHtIsFalseAndIsEnabledGoalRecordFtIsFalse_ReturnEmpty()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistFgLg = false,
            IsEnabledGoalRecordHt = false,
            IsEnabledGoalRecordFt = false
        };

        // Act

        var actual = service.AllResources(goalCondition, 1);

        // Assert
        Assert.Empty(actual);
    }

    [Fact]
    public void AllResourcesSettleDetermined_IsExistHtFgLgIsTrueAndGoalRecordIsNull_ArgumentExpect()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistHtFgLg = true
        };

        var expect = new GoalAction
        {
            FirstGoal = string.Empty,
            LastGoal = string.Empty,
            FirstGoalSettlementStatusId = SettlementStatus.Abandoned1H,
            LastGoalSettlementStatusId = SettlementStatus.Abandoned1H
        };

        actionResourceService.HalftimeResources(Arg.Any<GoalAction>()).Returns([]);

        // Act

        service.AllResourcesSettleDetermined(goalCondition);

        // Assert

        actionResourceService.Received().HalftimeResources(Arg.Is<GoalAction>(
            x =>
                x.FirstGoal == expect.FirstGoal
                && x.LastGoal == expect.LastGoal
                && x.FirstGoalSettlementStatusId == expect.FirstGoalSettlementStatusId
                && x.LastGoalSettlementStatusId == expect.LastGoalSettlementStatusId
        ));
    }

    [Fact]
    public void AllResourcesSettleDetermined_IsExistHtFgLgIsTrueAndGoalRecordIsNotNull_ArgumentExpect()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistHtFgLg = true,
            GoalRecord = "AHHA;HA"
        };

        var expect = new GoalAction
        {
            FirstGoal = "A",
            LastGoal = "",
            FirstGoalSettlementStatusId = SettlementStatus.Completed,
            LastGoalSettlementStatusId = SettlementStatus.Abandoned1H
        };

        goalRecordService.HalftimeGoal(Arg.Any<string>()).Returns("A");
        actionResourceService.HalftimeResources(Arg.Any<GoalAction>()).Returns([]);

        // Actual

        service.AllResourcesSettleDetermined(goalCondition);

        // Assert
        actionResourceService.Received().HalftimeResources(Arg.Is<GoalAction>(
            x =>
                x.FirstGoal == expect.FirstGoal
                && x.LastGoal == expect.LastGoal
                && x.FirstGoalSettlementStatusId == expect.FirstGoalSettlementStatusId
                && x.LastGoalSettlementStatusId == expect.LastGoalSettlementStatusId
        ));
    }

    [Fact]
    public void AllResourcesSettleDetermined_IsExistFgLgIsTrueAndGoalRecordIsNull_ArgumentExpect()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistFgLg = true
        };

        var expect = new GoalAction
        {
            FirstGoal = string.Empty,
            LastGoal = string.Empty,
            FirstGoalSettlementStatusId = SettlementStatus.Abandoned1H,
            LastGoalSettlementStatusId = SettlementStatus.Abandoned1H
        };

        actionResourceService.FullTimeResources(Arg.Any<GoalAction>()).Returns([]);

        // Act

        service.AllResourcesSettleDetermined(goalCondition);

        // Assert

        actionResourceService.Received().FullTimeResources(Arg.Is<GoalAction>(
            x =>
                x.FirstGoal == expect.FirstGoal
                && x.LastGoal == expect.LastGoal
                && x.FirstGoalSettlementStatusId == expect.FirstGoalSettlementStatusId
                && x.LastGoalSettlementStatusId == expect.LastGoalSettlementStatusId
        ));
    }

    [Fact]
    public void AllResourcesSettleDetermined_IsExistFgLgIsTrueAndGoalRecordIsNotNull_ArgumentExpect()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistFgLg = true,
            GoalRecord = "AHHA;HA"
        };

        var expect = new GoalAction
        {
            FirstGoal = "A",
            LastGoal = "",
            FirstGoalSettlementStatusId = SettlementStatus.Completed,
            LastGoalSettlementStatusId = SettlementStatus.Abandoned1H
        };

        goalRecordService.HalftimeGoal(Arg.Any<string>()).Returns("A");
        actionResourceService.FullTimeResources(Arg.Any<GoalAction>()).Returns([]);

        // Actual

        service.AllResourcesSettleDetermined(goalCondition);

        // Assert
        actionResourceService.Received().FullTimeResources(Arg.Is<GoalAction>(
            x =>
                x.FirstGoal == expect.FirstGoal
                && x.LastGoal == expect.LastGoal
                && x.FirstGoalSettlementStatusId == expect.FirstGoalSettlementStatusId
                && x.LastGoalSettlementStatusId == expect.LastGoalSettlementStatusId
        ));
    }

    [Fact]
    public void AllResourcesSettleDetermined_IsEnabledGoalRecordHtIsTrue_CallRightMethod()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsEnabledGoalRecordHt = true
        };

        actionResourceService.HalftimeGoalRecord(Arg.Any<string>(), Arg.Any<int>()).Returns(new XmlResource());

        // Actual

        service.AllResourcesSettleDetermined(goalCondition);

        // Assert
        actionResourceService.Received().HalftimeGoalRecord(Arg.Any<string>(), Arg.Is<int>(SettlementStatus.Abandoned1H));
    }

    [Fact]
    public void AllResourcesSettleDetermined_IsEnabledGoalRecordFtIsTrue_CallRightMethod()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsEnabledGoalRecordFt = true,
            GoalRecord = "AHAHA"
        };

        actionResourceService.FullTimeGoalRecord(Arg.Any<string>(), Arg.Any<int>()).Returns(new XmlResource());

        // Actual

        service.AllResourcesSettleDetermined(goalCondition);

        // Assert
        actionResourceService.Received().
            FullTimeGoalRecord(Arg.Is(goalCondition.GoalRecord), Arg.Is<int>(SettlementStatus.Abandoned1H));
    }

    [Fact]
    public void AllResourcesSettleDetermined_4ConditionIsAllTrue_ReturnExpect()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistHtFgLg = true,
            IsExistFgLg = true,
            IsEnabledGoalRecordHt = true,
            IsEnabledGoalRecordFt = true,
            GoalRecord = "AHAHA;HAH"
        };

        goalRecordService.HalftimeGoal(Arg.Any<string>()).Returns("AHAHA");
        actionResourceService.HalftimeResources(Arg.Any<GoalAction>()).Returns(
        [
            new XmlResource
            {
                HomeValue = "A",
                ResourceId = ResourceKey.HalftimeFirstGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Completed
            },

            new XmlResource
            {
                HomeValue = "A",
                ResourceId = ResourceKey.HalftimeLastGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Abandoned1H
            }
        ]);

        actionResourceService.FullTimeResources(Arg.Any<GoalAction>()).Returns([
            new XmlResource
            {
                HomeValue = "H",
                ResourceId = ResourceKey.FullTimeFirstGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Completed
            },

            new XmlResource
            {
                HomeValue = "H",
                ResourceId = ResourceKey.FullTimeLastGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Abandoned1H
            }
        ]);

        actionResourceService.HalftimeGoalRecord(Arg.Any<string>(), Arg.Any<int>()).Returns(
            new XmlResource
            {
                ResourceId = ResourceKey.HalftimeGoalRecord,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Abandoned1H,
                HomeValue = "AHAHA"
            });

        actionResourceService.FullTimeGoalRecord(Arg.Any<string>(), Arg.Any<int>()).Returns(
            new XmlResource
            {
                ResourceId = ResourceKey.HalftimeGoalRecord,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = SettlementStatus.Abandoned1H,
                HomeValue = "AHAHA;HAH"
            });

        // Actual

        var actual = service.AllResourcesSettleDetermined(goalCondition);

        // Assert
        Assert.Equal(6, actual.Count);
    }

    [Fact]
    public void AllResourcesSettleDetermined_4ConditionIsAllFalse_ReturnExpect()
    {
        // Arrange
        var goalCondition = new GoalCondition
        {
            IsExistHtFgLg = false,
            IsExistFgLg = false,
            IsEnabledGoalRecordHt = false,
            IsEnabledGoalRecordFt = false
        };

        // Actual

        var actual = service.AllResourcesSettleDetermined(goalCondition);

        // Assert
        Assert.Empty(actual);
    }

    [Fact]
    public void UnCalculateResources_IsExistHtFgLgIsTrue_ReturnExpect()
    {
        var goalCondition = new GoalCondition
        {
            IsExistHtFgLg = true
        };

        var expect = new List<XmlResource>
        {
            new()
            {
                ResourceId=ResourceKey.HalftimeFirstGoal,
                ResultStatusId = ResultStatus.Initial,
                SettlementStatusId = SettlementStatus.Running,
                HomeValue = string.Empty
            },
            new()
            {
                ResourceId=ResourceKey.HalftimeLastGoal,
                ResultStatusId = ResultStatus.Initial,
                SettlementStatusId = SettlementStatus.Running,
                HomeValue = string.Empty
            }
        };

        // Actual

        var actual = service.UnCalculateResources(goalCondition);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void UnCalculateResources_IsExistFgLgIsTrue_ReturnExpect()
    {
        var goalCondition = new GoalCondition
        {
            IsExistFgLg = true
        };

        var expect = new List<XmlResource>
        {
            new()
            {
                ResourceId=ResourceKey.FullTimeFirstGoal,
                ResultStatusId = ResultStatus.Initial,
                SettlementStatusId = SettlementStatus.Running,
                HomeValue = string.Empty
            },
            new()
            {
                ResourceId=ResourceKey.FullTimeLastGoal,
                ResultStatusId = ResultStatus.Initial,
                SettlementStatusId = SettlementStatus.Running,
                HomeValue = string.Empty
            }
        };

        // Actual

        var actual = service.UnCalculateResources(goalCondition);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void UnCalculateResources_IsEnabledGoalRecordHtIsTrue_ReturnExpect()
    {
        var goalCondition = new GoalCondition
        {
            IsEnabledGoalRecordHt = true
        };

        var expect = new List<XmlResource>
        {
            new()
            {
                ResourceId=ResourceKey.HalftimeGoalRecord,
                ResultStatusId = ResultStatus.Initial,
                SettlementStatusId = SettlementStatus.Running,
                HomeValue = string.Empty
            }
        };

        // Actual

        var actual = service.UnCalculateResources(goalCondition);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void UnCalculateResources_IsEnabledGoalRecordFtIsTrue_ReturnExpect()
    {
        var goalCondition = new GoalCondition
        {
            IsEnabledGoalRecordFt = true
        };

        var expect = new List<XmlResource>
        {
            new()
            {
                ResourceId=ResourceKey.FullTimeGoalRecord,
                ResultStatusId = ResultStatus.Initial,
                SettlementStatusId = SettlementStatus.Running,
                HomeValue = string.Empty
            }
        };

        // Actual

        var actual = service.UnCalculateResources(goalCondition);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void UnCalculateResources_4AllConditionIsTrue_Return6Record()
    {
        var goalCondition = new GoalCondition
        {
            IsExistHtFgLg = true,
            IsExistFgLg = true,
            IsEnabledGoalRecordHt = true,
            IsEnabledGoalRecordFt = true
        };

        // Actual

        var actual = service.UnCalculateResources(goalCondition);

        // Assert
        Assert.Equal(6, actual.Count);
    }

    [Fact]
    public void UnCalculateResources_4AllConditionIsFalse_ReturnEmpty()
    {
        var goalCondition = new GoalCondition
        {
            IsExistHtFgLg = false,
            IsExistFgLg = false,
            IsEnabledGoalRecordHt = false,
            IsEnabledGoalRecordFt = false
        };

        // Actual

        var actual = service.UnCalculateResources(goalCondition);

        // Assert
        Assert.Empty(actual);
    }

    [Fact]
    public void UnCalculateFtResources_ExistScoreHT_ReturnExpect()
    {
        const string goalRecord = "h;";

        var expect = new List<XmlResource>
        {
            new()
            {
                ResourceId=ResourceKey.FullTime,
                ResultStatusId = ResultStatus.Initial,
                SettlementStatusId = SettlementStatus.Running,
                HomeValue = string.Empty
            },

            new()
        {
            ResourceId=ResourceKey.FullTimeLastGoal,
            ResultStatusId = ResultStatus.Initial,
            SettlementStatusId = SettlementStatus.Running,
            HomeValue = string.Empty
        },

        new()
        {
            ResourceId=ResourceKey.FullTimeGoalRecord,
            ResultStatusId = ResultStatus.Initial,
            SettlementStatusId = SettlementStatus.Running,
            HomeValue = string.Empty
        }
        };
        goalRecordService.HalftimeGoal(Arg.Any<string>()).Returns("h");

        // Actual

        var actual = service.UnCalculateFtResources(goalRecord);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void UnCalculateFtResources_NotExistScoreHT_ReturnExpect()
    {
        const string goalRecord = ";h";

        var expect = new List<XmlResource>
        {
            new()
            {
                ResourceId=ResourceKey.FullTime,
                ResultStatusId = ResultStatus.Initial,
                SettlementStatusId = SettlementStatus.Running,
                HomeValue = string.Empty
            },

            new()
            {
                ResourceId=ResourceKey.FullTimeLastGoal,
                ResultStatusId = ResultStatus.Initial,
                SettlementStatusId = SettlementStatus.Running,
                HomeValue = string.Empty
            },

            new()
            {
                ResourceId=ResourceKey.FullTimeGoalRecord,
                ResultStatusId = ResultStatus.Initial,
                SettlementStatusId = SettlementStatus.Running,
                HomeValue = string.Empty
            },

            new()
            {
                ResourceId=ResourceKey.FullTimeFirstGoal,
                ResultStatusId = ResultStatus.Initial,
                SettlementStatusId = SettlementStatus.Running,
                HomeValue = string.Empty
            }
        };

        // Actual
        goalRecordService.HalftimeGoal(Arg.Any<string>()).Returns(string.Empty);

        var actual = service.UnCalculateFtResources(goalRecord);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expect), JsonConvert.SerializeObject(actual));
    }
}