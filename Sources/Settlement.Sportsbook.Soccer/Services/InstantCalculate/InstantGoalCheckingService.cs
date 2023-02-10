using Settlement.Sportsbook.Soccer.Models;

namespace Settlement.Sportsbook.Soccer.Services.InstantCalculate;

public interface IInstantGoalCheckingService
{
    bool IsHalftimeGoalChecking(InstantGoalCondition goalCondition);

    bool IsFullTimeGoallChecking(InstantGoalCondition goalCondition);
}

public class InstantGoalCheckingServiceImp : IInstantGoalCheckingService
{
    public bool IsHalftimeGoalChecking(InstantGoalCondition goalCondition)
    {
        var firtGoalRecordHalftime = HalftimeFirstGoal(goalCondition.GoalRecord);
        return goalCondition.IsHalfTime && !firtGoalRecordHalftime.Equals(goalCondition.FirstGoalValue);
    }

    public bool IsFullTimeGoallChecking(InstantGoalCondition goalCondition)
    {
        var firtGoalRecordFullTime = goalCondition.GoalRecord.Replace(";", string.Empty);

        if (goalCondition.GoalRecord.Length > 1)
        {
            firtGoalRecordFullTime = firtGoalRecordFullTime.Substring(0, 1);
        }

        return !firtGoalRecordFullTime.Equals(goalCondition.FirstGoalValue);
    }

    private static string HalftimeFirstGoal(string goalRecord)
    {
        return goalRecord.IndexOf(';') >= 1
            ? goalRecord.Split(';')[0].Substring(0, 1)
            : goalRecord;
    }
}