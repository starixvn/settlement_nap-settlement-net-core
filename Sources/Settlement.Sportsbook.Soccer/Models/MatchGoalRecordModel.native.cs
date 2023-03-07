namespace Settlement.Sportsbook.Soccer.Models;

public class MatchGoalRecordModel
{
    public bool IsExistHtFgNg { get; set; }

    public bool IsExistFgNg { get; set; }

    public bool IsExistFG { get; set; }

    public bool IsExistHTFG { get; set; }

    public string GoalRecord { get; set; }

    public string BetStatus { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }
}