using Newtonsoft.Json;
using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Services;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services;

public class ActionResourceServiceTests
{
    private readonly IActionResourceService service;

    public ActionResourceServiceTests()
    {
        var goalRecordService = new GoalRecordServiceImp();
        service = new ActionResourceServiceImp(goalRecordService);
    }

    private static XmlResource CreateResource(string resourceId, int resultStatusId, int settlementStatusId, string homeValue)
    {
        return new XmlResource
        {
            ResourceId = resourceId,
            ResultStatusId = resultStatusId,
            SettlementStatusId = settlementStatusId,
            HomeValue = homeValue
        };
    }

    [Fact]
    public void HalftimeResources_Always_ReturnsTwoItemsOnResourcesList()
    {
        // Arrange
        var goalAction = new GoalAction
        {
            FirstGoal = "",
            LastGoal = ""
        };

        // Act
        var actual = service.HalftimeResources(goalAction);

        // Assert
        Assert.True(actual.Count == 2);
    }

    [Fact]
    public void HalftimeResources_IsEmptyGoalAndCalculationAction_ReturnsExpectedResourcesList()
    {
        // Arrange
        var goalAction = new GoalAction
        {
            FirstGoal = "",
            LastGoal = "",
            FirstGoalSettlementStatusId = SettlementStatus.Completed,
            LastGoalSettlementStatusId = SettlementStatus.Completed
        };

        // Act
        var actual = service.HalftimeResources(goalAction);

        // Assert
        var expectedXmlResource = new List<XmlResource> {
            CreateResource(ResourceKey.HalftimeFirstGoal, ResultStatus.ManuallySettled, SettlementStatus.Completed, "N"),
            CreateResource(ResourceKey.HalftimeLastGoal,ResultStatus.ManuallySettled, SettlementStatus.Completed, "N")
        };

        Assert.Equal(JsonConvert.SerializeObject(expectedXmlResource), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void HalftimeResources_IsEmptyGoalAndRefundAction_ReturnsExpectedResourcesList()
    {
        // Arrange
        var goalAction = new GoalAction
        {
            FirstGoal = "",
            LastGoal = "",
            FirstGoalSettlementStatusId = SettlementStatus.RefundHt,
            LastGoalSettlementStatusId = SettlementStatus.RefundHt
        };

        // Act
        var actual = service.HalftimeResources(goalAction);

        // Assert
        var expectedXmlResource = new List<XmlResource> {
            CreateResource(ResourceKey.HalftimeFirstGoal, ResultStatus.ManuallySettled, SettlementStatus.RefundHt, ""),
            CreateResource(ResourceKey.HalftimeLastGoal,ResultStatus.ManuallySettled, SettlementStatus.RefundHt, "")
        };

        Assert.Equal(JsonConvert.SerializeObject(expectedXmlResource), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void HalftimeResources_HasHalftimeGoalOnGoalRecord_ReturnsExpectedResult()
    {
        // Arrange
        var goalAction = new GoalAction
        {
            FirstGoal = "AHAAH",
            LastGoal = "AHAAH",
            FirstGoalSettlementStatusId = SettlementStatus.Completed,
            LastGoalSettlementStatusId = SettlementStatus.Completed
        };

        // Act
        var actual = service.HalftimeResources(goalAction);

        // Assert
        var expectedXmlResource = new List<XmlResource> {
            CreateResource(ResourceKey.HalftimeFirstGoal, ResultStatus.ManuallySettled, SettlementStatus.Completed, "A"),
            CreateResource(ResourceKey.HalftimeLastGoal,ResultStatus.ManuallySettled, SettlementStatus.Completed, "H")
        };
        Assert.Equal(JsonConvert.SerializeObject(expectedXmlResource), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void FullTimeResources_Always_ReturnsTwoItemsOnResourcesList()
    {
        // Arrange
        var goalAction = new GoalAction
        {
            FirstGoal = "",
            LastGoal = ""
        };

        // Act
        var actual = service.FullTimeResources(goalAction);

        // Assert
        Assert.True(actual.Count == 2);
    }

    [Fact]
    public void FullTimeResources_IsEmptyGoalAndCalculationAction_ReturnsExpectedResourcesList()
    {
        // Arrange
        var goalAction = new GoalAction
        {
            FirstGoal = "",
            LastGoal = "",
            FirstGoalSettlementStatusId = SettlementStatus.Completed,
            LastGoalSettlementStatusId = SettlementStatus.Completed
        };

        // Act
        var actual = service.FullTimeResources(goalAction);

        // Assert
        var expectedXmlResource = new List<XmlResource> {
            CreateResource(ResourceKey.FullTimeFirstGoal, ResultStatus.ManuallySettled, SettlementStatus.Completed, "N"),
            CreateResource(ResourceKey.FullTimeLastGoal,ResultStatus.ManuallySettled, SettlementStatus.Completed, "N")
        };

        Assert.Equal(JsonConvert.SerializeObject(expectedXmlResource), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void FullTimeResources_IsEmptyGoalAndRefundAction_ReturnsExpectedResourcesList()
    {
        // Arrange
        var goalAction = new GoalAction
        {
            FirstGoal = "",
            LastGoal = "",
            FirstGoalSettlementStatusId = SettlementStatus.Refund,
            LastGoalSettlementStatusId = SettlementStatus.Refund
        };

        // Act
        var actual = service.FullTimeResources(goalAction);

        // Assert
        var expectedXmlResource = new List<XmlResource> {
            CreateResource(ResourceKey.FullTimeFirstGoal, ResultStatus.ManuallySettled, SettlementStatus.Refund, ""),
            CreateResource(ResourceKey.FullTimeLastGoal,ResultStatus.ManuallySettled, SettlementStatus.Refund, "")
        };

        Assert.Equal(JsonConvert.SerializeObject(expectedXmlResource), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void FullTimeResources_HasFullTimeGoalOnGoalRecord_ReturnsExpectedResult()
    {
        // Arrange
        var goalAction = new GoalAction
        {
            FirstGoal = "AHAA",
            LastGoal = "AHAA",
            FirstGoalSettlementStatusId = SettlementStatus.Completed,
            LastGoalSettlementStatusId = SettlementStatus.Completed
        };

        // Act
        var actual = service.FullTimeResources(goalAction);

        // Assert
        var expectedXmlResource = new List<XmlResource> {
            CreateResource(ResourceKey.FullTimeFirstGoal, ResultStatus.ManuallySettled, SettlementStatus.Completed, "A"),
            CreateResource(ResourceKey.FullTimeLastGoal,ResultStatus.ManuallySettled, SettlementStatus.Completed, "A")
        };

        Assert.Equal(JsonConvert.SerializeObject(expectedXmlResource), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void FullTimeGoalRecord_Always_ReturnsExpectedResource()
    {
        // Arrange
        const string goalRecord = ";HAA";
        const int settlementStatusId = 1;

        // Act
        var actual = service.FullTimeGoalRecord(goalRecord, settlementStatusId);

        // Assert
        var expectedXmlResource = CreateResource(ResourceKey.FullTimeGoalRecord, ResultStatus.ManuallySettled, settlementStatusId, goalRecord);
        Assert.Equal(JsonConvert.SerializeObject(expectedXmlResource), JsonConvert.SerializeObject(actual));
    }

    [Fact]
    public void HalftimeGoalRecord_Always_ReturnsExpectedResource()
    {
        // Arrange
        const string goalRecord = "AH;";
        const int settlementStatusId = 1;

        // Act
        var actual = service.HalftimeGoalRecord(goalRecord, settlementStatusId);

        // Assert
        var expectedXmlResource = CreateResource(ResourceKey.HalftimeGoalRecord, ResultStatus.ManuallySettled, settlementStatusId, goalRecord);
        Assert.Equal(JsonConvert.SerializeObject(expectedXmlResource), JsonConvert.SerializeObject(actual));
    }
}