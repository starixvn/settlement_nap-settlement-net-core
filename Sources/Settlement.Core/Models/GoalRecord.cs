namespace Settlement.Core.Models;

public class GoalRecord
{
    public GoalRecord(
        bool isCalRefund,
        string goal,
        string betStatus,
        int? halfTimeHomeScore,
        int? halfTimeAwayScore)
    {
        IsCalRefund = isCalRefund;
        BetStatus = betStatus;
        HalfTimeHomeScore = halfTimeHomeScore;
        HalfTimeAwayScore = halfTimeAwayScore;
        Goal = goal;
    }

    public bool IsCalRefund { get; set; }

    public string BetStatus { get; set; }

    public int? HalfTimeHomeScore { get; set; }

    public int? HalfTimeAwayScore { get; set; }

    public string Goal { get; set; }

    public string GetGoalRecord()
    {
        if (!IsCalRefund || string.IsNullOrWhiteSpace(BetStatus))
        {
            return Goal;
        }

        var index = BetStatus.IgnoreCaseIndexOf("FL:");

        if (string.IsNullOrWhiteSpace(Goal) || index <= -1)
        {
            return Goal;
        }

        var homeAwayGoal = BetStatus.Substring(index + 3).Split('-');

        var lastGoalScoredTeam = homeAwayGoal[1];
        var firstGoalScoredTeam = homeAwayGoal[0];

        if (lastGoalScoredTeam.Equals("0") && !firstGoalScoredTeam.Equals("0"))
        {
            return Goal[..((int)HalfTimeAwayScore + (int)HalfTimeHomeScore)];
        }

        return Goal;
    }
}