namespace Settlement.Sportsbook.Soccer.Models;

public class InstantGoalCondition
{
    private string firstGoalValue = string.Empty;
    private string goalRecord = string.Empty;

    public bool IsExistHtFgNg { get; set; }
    public bool IsExistFgNg { get; set; }
    public bool IsExistHtFgLg { get; set; }
    public bool IsExistFgLg { get; set; }
    public bool IsExistCorner { get; set; }
    public bool IsExistHTCorner { get; set; }
    public bool IsExistFirstCorner { get; set; }
    public bool IsExistHTFirstCorner { get; set; }
    public bool IsExist2HFirstCorner { get; set; }
    public bool IsHalfTime { get; set; }

    public string GoalRecord
    {
        get => goalRecord ?? string.Empty;
        set => goalRecord = value;
    }

    public string FirstGoalValue
    {
        get => firstGoalValue ?? string.Empty;
        set => firstGoalValue = value;
    }
}