namespace Settlement.Core.Models;

public class GoalRecord(
    bool isCalRefund,
    string goal,
    string betStatus,
    int? halfTimeHomeScore,
    int? halfTimeAwayScore)
{
    public bool IsCalRefund { get; set; } = isCalRefund;

    public string BetStatus { get; set; } = betStatus;

    public int? HalfTimeHomeScore { get; set; } = halfTimeHomeScore;

    public int? HalfTimeAwayScore { get; set; } = halfTimeAwayScore;

    public string Goal { get; set; } = goal;

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

        var homeAwayGoal = BetStatus[(index + 3)..].Split('-');

        var lastGoalScoredTeam = homeAwayGoal[1];
        var firstGoalScoredTeam = homeAwayGoal[0];

        var isExistedHalfTimeScore = HalfTimeAwayScore != null && HalfTimeHomeScore != null;
        if (lastGoalScoredTeam.Equals("0") && !firstGoalScoredTeam.Equals("0") && isExistedHalfTimeScore)
        {
            return Goal[..((int)HalfTimeAwayScore + (int)HalfTimeHomeScore)];
        }

        return Goal;
    }
}