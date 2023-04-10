using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Models;

namespace Settlement.Sportsbook.Soccer.Services;

public interface IResourceService
{
    List<XmlResource> HalftimeResources(GoalCondition goalCondition, int settlementStatusId);

    List<XmlResource> FullTimeResources(GoalCondition goalCondition, int settlementStatusId);

    List<XmlResource> AllResources(GoalCondition goalCondition, int settlementStatusId);

    List<XmlResource> UnCalculateResources(GoalCondition goalCondition);

    List<XmlResource> FullTimeResourcesSettleDetermined(GoalCondition goalCondition);

    List<XmlResource> AllResourcesSettleDetermined(GoalCondition goalCondition);
}

public class ResourceServiceImp : IResourceService
{
    private readonly IActionResourceService actionResourceService;

    private readonly IGoalRecordService goalRecordService;

    public ResourceServiceImp(IActionResourceService actionResourceService, IGoalRecordService goalRecordService)
    {
        this.actionResourceService = actionResourceService;
        this.goalRecordService = goalRecordService;
    }

    public List<XmlResource> HalftimeResources(GoalCondition goalCondition, int settlementStatusId)
    {
        var halftimeGoal = goalRecordService.HalftimeGoal(goalCondition.GoalRecord);

        var goalAction = CreateGoalAction(halftimeGoal, settlementStatusId);
        var resources = goalCondition.IsExistHtFgLg ? actionResourceService.HalftimeResources(goalAction) : new List<XmlResource>();

        if (goalCondition.IsExistFgNg)
        {
            var firstGoal = goalRecordService.FirstGoalRecord(goalAction.FirstGoal, goalAction.IsRefund);
            var resource = actionResourceService.FullTimeResource(firstGoal, settlementStatusId);
            resources.Add(resource);
        }

        if (goalCondition.IsEnabledGoalRecordHt)
        {
            var resource = actionResourceService.HalftimeGoalRecord(halftimeGoal, settlementStatusId);
            resources.Add(resource);
        }

        return resources;
    }

    public List<XmlResource> FullTimeResources(GoalCondition goalCondition, int settlementStatusId)
    {
        var halftime = goalRecordService.HalftimeGoal(goalCondition.GoalRecord);
        var fullTime = goalRecordService.FullTimeGoal(goalCondition.GoalRecord);
        var fullTimeGoal = $"{halftime}{fullTime}";
        var goalAction = CreateGoalAction(fullTimeGoal, settlementStatusId);
        var resources = goalCondition.IsExistFgLg ? actionResourceService.FullTimeResources(goalAction) : new List<XmlResource>();

        if (goalCondition.IsEnabledGoalRecordFt)
        {
            var resourcesGoal = actionResourceService.FullTimeGoalRecord(goalCondition.GoalRecord, settlementStatusId);
            resources.Add(resourcesGoal);
        }

        return resources;
    }

    public List<XmlResource> AllResources(GoalCondition goalCondition, int settlementStatusId)
    {
        var halftime = goalRecordService.HalftimeGoal(goalCondition.GoalRecord);

        var goalAction = CreateGoalAction(halftime, settlementStatusId);
        var resources = goalCondition.IsExistHtFgLg ? actionResourceService.HalftimeResources(goalAction) : new List<XmlResource>();

        if (goalCondition.IsExistFgLg)
        {
            var fullTime = goalRecordService.FullTimeGoal(goalCondition.GoalRecord);
            var fullTimeGoal = $"{halftime}{fullTime}";
            goalAction = CreateGoalAction(fullTimeGoal, settlementStatusId);
            var resourcesFullTime = actionResourceService.FullTimeResources(goalAction);
            resources.AddRange(resourcesFullTime);
        }

        if (goalCondition.IsEnabledGoalRecordHt)
        {
            halftime = goalRecordService.HalftimeGoal(goalCondition.GoalRecord);
            var resourcesGoal = actionResourceService.HalftimeGoalRecord(halftime, settlementStatusId);
            resources.Add(resourcesGoal);
        }

        if (goalCondition.IsEnabledGoalRecordFt)
        {
            var resourcesGoal = actionResourceService.FullTimeGoalRecord(goalCondition.GoalRecord, settlementStatusId);
            resources.Add(resourcesGoal);
        }

        return resources;
    }

    public List<XmlResource> UnCalculateResources(GoalCondition goalCondition)
    {
        var resources = new List<XmlResource>();
        if (goalCondition.IsExistHtFgLg)
        {
            resources.Add(InitialResource(ResourceKey.HalftimeFirstGoal));
            resources.Add(InitialResource(ResourceKey.HalftimeLastGoal));
        }

        if (goalCondition.IsExistFgLg)
        {
            resources.Add(InitialResource(ResourceKey.FullTimeFirstGoal));
            resources.Add(InitialResource(ResourceKey.FullTimeLastGoal));
        }

        if (goalCondition.IsEnabledGoalRecordHt)
        {
            resources.Add(InitialResource(ResourceKey.HalftimeGoalRecord));
        }

        if (goalCondition.IsEnabledGoalRecordFt)
        {
            resources.Add(InitialResource(ResourceKey.FullTimeGoalRecord));
        }

        return resources;
    }

    public List<XmlResource> FullTimeResourcesSettleDetermined(GoalCondition goalCondition)
    {
        var resources = new List<XmlResource>();

        if (goalCondition.IsExistFgLg)
        {
            GoalAction goalAction;
            if (string.IsNullOrWhiteSpace(goalCondition.GoalRecord.Replace(";", string.Empty)))
            {
                goalAction = CreateGoalAction(string.Empty, SettlementStatus.Abandoned2H);
            }
            else
            {
                var halftime = goalRecordService.HalftimeGoal(goalCondition.GoalRecord);
                var fullTime = goalRecordService.FullTimeGoal(goalCondition.GoalRecord);
                var goal = $"{halftime}{fullTime}";
                goalAction = CreateGoalAction(goal, SettlementStatus.Completed, SettlementStatus.Abandoned2H);
            }

            var res = actionResourceService.FullTimeResources(goalAction);
            resources.AddRange(res);
        }

        if (goalCondition.IsEnabledGoalRecordFt)
        {
            var res = actionResourceService.FullTimeGoalRecord(goalCondition.GoalRecord, SettlementStatus.Abandoned2H);
            resources.Add(res);
        }

        return resources;
    }

    public List<XmlResource> AllResourcesSettleDetermined(GoalCondition goalCondition)
    {
        var resources = new List<XmlResource>();
        var halftimeGoal = goalRecordService.HalftimeGoal(goalCondition.GoalRecord);

        if (goalCondition.IsExistHtFgLg)
        {
            var goalAction = string.IsNullOrWhiteSpace(halftimeGoal)
                ? CreateGoalAction(string.Empty, SettlementStatus.Abandoned1H)
                : CreateGoalAction(halftimeGoal, SettlementStatus.Completed, SettlementStatus.Abandoned1H);

            var res = actionResourceService.HalftimeResources(goalAction);
            resources.AddRange(res);
        }

        if (goalCondition.IsExistFgLg)
        {
            var goalAction = string.IsNullOrWhiteSpace(halftimeGoal)
                ? CreateGoalAction(string.Empty, SettlementStatus.Abandoned1H)
                : CreateGoalAction(halftimeGoal, SettlementStatus.Completed, SettlementStatus.Abandoned1H);

            var res = actionResourceService.FullTimeResources(goalAction);
            resources.AddRange(res);
        }

        if (goalCondition.IsEnabledGoalRecordHt)
        {
            var res = actionResourceService.HalftimeGoalRecord(halftimeGoal, SettlementStatus.Abandoned1H);
            resources.Add(res);
        }

        if (goalCondition.IsEnabledGoalRecordFt)
        {
            var res = actionResourceService.FullTimeGoalRecord(goalCondition.GoalRecord, SettlementStatus.Abandoned1H);
            resources.Add(res);
        }

        return resources;
    }

    private static XmlResource InitialResource(string resourceId)
    {
        return new XmlResource
        {
            ResourceId = resourceId,
            ResultStatusId = ResultStatus.Initial,
            SettlementStatusId = SettlementStatus.Running,
            HomeValue = string.Empty
        };
    }

    private static GoalAction CreateGoalAction(string goal, int settlementStatusId)
    {
        return new GoalAction
        {
            FirstGoal = goal,
            LastGoal = goal,
            FirstGoalSettlementStatusId = settlementStatusId,
            LastGoalSettlementStatusId = settlementStatusId
        };
    }

    private static GoalAction CreateGoalAction(string halftimeGoal, int firstGoalSettlementStatusId, int lastGoalSettlementStatusId)
    {
        return new GoalAction
        {
            FirstGoal = halftimeGoal,
            LastGoal = string.Empty,
            FirstGoalSettlementStatusId = firstGoalSettlementStatusId,
            LastGoalSettlementStatusId = lastGoalSettlementStatusId
        };
    }
}