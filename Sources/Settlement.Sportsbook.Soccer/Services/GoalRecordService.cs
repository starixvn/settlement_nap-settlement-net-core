using Settlement.Sportsbook.Soccer.Models;

namespace Settlement.Sportsbook.Soccer.Services;

public interface IGoalRecordService
{
    string NoGoalFullTime { get; }

    string HomeOrAwayFirstGoal(string goal);

    GoalRecordModel GoalRecordWithSemicolon(GoalRecordModel goalRecord, string goal);

    string HalftimeGoal(string goalRecord);

    string FullTimeGoal(string goalRecord);

    string FirstGoalRecord(string goalRecord, bool isRefund);

    string LastGoalRecord(string goalRecord, bool isRefund);
}

public class GoalRecordServiceImp : IGoalRecordService
{
    public string NoGoalFullTime
    {
        get
        {
            var goalRecord = new GoalRecordModel
            {
                IsExistFgLg = true,
                FirstGoal = "0",
                LastGoal = "0"
            };

            return goalRecord.FullTimeBetStatus;
        }
    }

    public GoalRecordModel GoalRecordWithSemicolon(GoalRecordModel goalRecord, string goal)
    {
        if (string.IsNullOrWhiteSpace(goal))
        {
            goalRecord.FirstGoal = "0";
            goalRecord.LastGoal = "0";
        }
        else
        {
            goalRecord.FirstGoal = HomeOrAwayFirstGoal(goal);
            goalRecord.LastGoal = HomeOrAwayLastGoal(goal);
        }

        return goalRecord;
    }

    public string HomeOrAwayFirstGoal(string goal)
    {
        return goal.IgnoreCaseStartsWith("h") ? "1" : "2";
    }

    private static string HomeOrAwayLastGoal(string goal)
    {
        return goal.IgnoreCaseEndsWith("h") ? "1" : "2";
    }

    private const string NoGoal = "N";

    public string HalftimeGoal(string goalRecord)
    {
        return IsExistedSemiColon(goalRecord) ? goalRecord.Split(';')[0] : goalRecord;
    }

    public string FullTimeGoal(string goalRecord)
    {
        return IsExistedSemiColon(goalRecord) ? goalRecord.Split(';')[1] : string.Empty;
    }

    public string FirstGoalRecord(string goalRecord, bool isRefund)
    {
        if (string.IsNullOrWhiteSpace(goalRecord))
        {
            return isRefund ? string.Empty : NoGoal;
        }

        return goalRecord.Substring(0, 1);
    }

    public string LastGoalRecord(string goalRecord, bool isRefund)
    {
        if (string.IsNullOrWhiteSpace(goalRecord))
        {
            return isRefund ? string.Empty : NoGoal;
        }

        return goalRecord.Substring(goalRecord.Length - 1, 1);
    }

    private static bool IsExistedSemiColon(string goalRecord)
    {
        return goalRecord.IndexOf(';') >= 0;
    }
}