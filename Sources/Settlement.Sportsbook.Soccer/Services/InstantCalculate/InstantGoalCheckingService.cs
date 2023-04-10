using Settlement.Sportsbook.Soccer.Models;

namespace Settlement.Sportsbook.Soccer.Services.InstantCalculate;

public interface IInstantGoalCheckingService
{
    bool IsHalftimeGoalChecking(InstantGoalCondition goalCondition);

    bool IsFullTimeGoalChecking(InstantGoalCondition goalCondition);
}

public class InstantGoalCheckingServiceImp : IInstantGoalCheckingService
{
    public bool IsHalftimeGoalChecking(InstantGoalCondition goalCondition)
    {
        var firstGoalRecordHalftime = HalftimeFirstGoal(goalCondition.GoalRecord);
        return goalCondition.IsHalfTime && !firstGoalRecordHalftime.Equals(goalCondition.FirstGoalValue);
    }

    public bool IsFullTimeGoalChecking(InstantGoalCondition goalCondition)
    {
        var firstGoalRecordFullTime = goalCondition.GoalRecord.Replace(";", string.Empty);

        if (goalCondition.GoalRecord.Length > 1)
        {
            firstGoalRecordFullTime = firstGoalRecordFullTime.Substring(0, 1);
        }

        return !firstGoalRecordFullTime.Equals(goalCondition.FirstGoalValue);
    }

    private static string HalftimeFirstGoal(string goalRecord)
    {
        return goalRecord.IndexOf(';') >= 1
            ? goalRecord.Split(';')[0].Substring(0, 1)
            : goalRecord;
    }
}