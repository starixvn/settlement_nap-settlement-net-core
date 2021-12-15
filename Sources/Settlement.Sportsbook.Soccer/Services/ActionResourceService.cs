using System.Collections.Generic;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Models;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface IActionResourceService
    {
        List<XmlResource> HalftimeResources(GoalAction goalAction);

        List<XmlResource> FullTimeResources(GoalAction goalAction);

        XmlResource FullTimeGoalRecord(string goalRecord, int settlementStatusId);

        XmlResource HalftimeGoalRecord(string goalRecord, int settlementStatusId);
    }

    public class ActionResourceServiceImp : IActionResourceService
    {
        private readonly IGoalRecordService goalRecordService;

        public ActionResourceServiceImp(IGoalRecordService goalRecordService)
        {
            this.goalRecordService = goalRecordService;
        }

        public List<XmlResource> HalftimeResources(GoalAction goalAction)
        {
            var fristGoal = goalRecordService.FirstGoalRecord(goalAction.FirstGoal, goalAction.IsRefund);
            var lastGoal = goalRecordService.LastGoalRecord(goalAction.LastGoal, goalAction.IsRefund);
            return new List<XmlResource> {
                    SettleResource(ResourceKey.HalftimeFirstGoal, fristGoal, goalAction.FirstGoalSettlementStatusId),
                    SettleResource(ResourceKey.HalftimeLastGoal, lastGoal, goalAction.LastGoalSettlementStatusId)
                };
        }

        public XmlResource HalftimeGoalRecord(string goalRecord, int settlementStatusId)
        {
            return SettleResource(ResourceKey.HalftimeGoalRecord, goalRecord, settlementStatusId);
        }

        public List<XmlResource> FullTimeResources(GoalAction goalAction)
        {
            var firstGoal = goalRecordService.FirstGoalRecord(goalAction.FirstGoal, goalAction.IsRefund);
            var lastGoal = goalRecordService.LastGoalRecord(goalAction.LastGoal, goalAction.IsRefund);
            return new List<XmlResource> {
                    SettleResource(ResourceKey.FullTimeFirstGoal, firstGoal, goalAction.FirstGoalSettlementStatusId),
                    SettleResource(ResourceKey.FullTimeLastGoal, lastGoal, goalAction.LastGoalSettlementStatusId)
            };
        }

        public XmlResource FullTimeGoalRecord(string goalRecord, int settlementStatusId)
        {
            return SettleResource(ResourceKey.FullTimeGoalRecord, goalRecord, settlementStatusId);
        }

        private XmlResource SettleResource(string resourceId, string homeValue, int settlementStatusId)
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
}