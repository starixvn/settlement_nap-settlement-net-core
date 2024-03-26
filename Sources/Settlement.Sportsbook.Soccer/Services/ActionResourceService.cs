using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Models;

namespace Settlement.Sportsbook.Soccer.Services;

public interface IActionResourceService
{
    List<XmlResource> HalftimeResources(GoalAction goalAction);

    List<XmlResource> FullTimeResources(GoalAction goalAction);

    XmlResource FullTimeResource(string firstGoal, int settlementStatusId);

    XmlResource FullTimeGoalRecord(string goalRecord, int settlementStatusId);

    XmlResource HalftimeGoalRecord(string goalRecord, int settlementStatusId);
}

public class ActionResourceServiceImp(IGoalRecordService goalRecordService) : IActionResourceService
{
    public List<XmlResource> HalftimeResources(GoalAction goalAction)
    {
        var firstGoal = goalRecordService.FirstGoalRecord(goalAction.FirstGoal, goalAction.IsRefund);
        var lastGoal = goalRecordService.LastGoalRecord(goalAction.LastGoal, goalAction.IsRefund);
        return
        [
            SettleResource(ResourceKey.HalftimeFirstGoal, firstGoal, goalAction.FirstGoalSettlementStatusId),
            SettleResource(ResourceKey.HalftimeLastGoal, lastGoal, goalAction.LastGoalSettlementStatusId)
        ];
    }

    public XmlResource HalftimeGoalRecord(string goalRecord, int settlementStatusId)
    {
        return SettleResource(ResourceKey.HalftimeGoalRecord, goalRecord, settlementStatusId);
    }

    public XmlResource FullTimeResource(string firstGoal, int settlementStatusId)
    {
        return SettleResource(ResourceKey.FullTimeFirstGoal, firstGoal, settlementStatusId);
    }

    public List<XmlResource> FullTimeResources(GoalAction goalAction)
    {
        var firstGoal = goalRecordService.FirstGoalRecord(goalAction.FirstGoal, goalAction.IsRefund);
        var lastGoal = goalRecordService.LastGoalRecord(goalAction.LastGoal, goalAction.IsRefund);
        return
        [
            SettleResource(ResourceKey.FullTimeFirstGoal, firstGoal, goalAction.FirstGoalSettlementStatusId),
            SettleResource(ResourceKey.FullTimeLastGoal, lastGoal, goalAction.LastGoalSettlementStatusId)
        ];
    }

    public XmlResource FullTimeGoalRecord(string goalRecord, int settlementStatusId)
    {
        return SettleResource(ResourceKey.FullTimeGoalRecord, goalRecord, settlementStatusId);
    }

    private static XmlResource SettleResource(string resourceId, string homeValue, int settlementStatusId)
    {
        return new XmlResource
        {
            ResourceId = resourceId,
            ResultStatusId = ResultStatus.ManuallySettled,
            SettlementStatusId = settlementStatusId,
            HomeValue = homeValue
        };
    }
}