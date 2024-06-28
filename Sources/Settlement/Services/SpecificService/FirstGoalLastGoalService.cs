namespace Settlement.Services.SpecificService;

using Models;

public interface FirstGoalLastGoalService
{
    GoalModel GetHalftimeGoalByBetStatus(GoalIconQueryModel query);

    GoalModel GetFullTimeGoalByBetStatus(GoalIconQueryModel query);

    GoalModel GetHalftimeGoalByGoalRecord(string goalRecord);

    GoalModel GetFullTimeGoalByGoalRecord(string goalRecord, bool isFinalScore);
}

public class FirstGoalLastGoalServiceImp : FirstGoalLastGoalService
{
    private const string HtPrefix = "ht-";
    private const string HtFirstLastGoalSymbol = "1FL:";
    private const string FtFirstLastGoalSymbol = "FL:";
    private const string FirstGoal = "first-goal";
    private const string LastGoal = "last-goal";
    private const string FirstLastGoal = "first-last-goal";
    private const string HtFirstGoal = "ht-first-goal";
    private const string HtLastGoal = "ht-last-goal";
    private const string HtFirstLastGoal = "ht-first-last-goal";
    private const int FirstLastGoalLength = 3;

    public GoalModel GetHalftimeGoalByBetStatus(GoalIconQueryModel query)
    {
        var pos = query.BetStatus.IndexOf(HtFirstLastGoalSymbol, StringComparison.OrdinalIgnoreCase);

        if (pos > -1)
        {
            var halfTimeBetStatus = query.BetStatus.Substring(pos + HtFirstLastGoalSymbol.Length, FirstLastGoalLength);
            var goalIcon = CreateGoalIconModelOnBetStatus(halfTimeBetStatus);

            if (!string.IsNullOrEmpty(goalIcon.Home))
            {
                goalIcon.Home = HtPrefix + goalIcon.Home;
            }

            if (!string.IsNullOrEmpty(goalIcon.Away))
            {
                goalIcon.Away = HtPrefix + goalIcon.Away;
            }

            return goalIcon;
        }

        return new GoalModel();
    }

    public GoalModel GetFullTimeGoalByBetStatus(GoalIconQueryModel query)
    {
        var fullTimeBetStatus = query.BetStatus.Replace(HtFirstLastGoalSymbol, string.Empty);
        var pos = fullTimeBetStatus.IndexOf(FtFirstLastGoalSymbol, StringComparison.Ordinal);

        if (pos > -1)
        {
            fullTimeBetStatus = fullTimeBetStatus.Substring(pos + FtFirstLastGoalSymbol.Length, FirstLastGoalLength);

            return CreateGoalIconModelOnBetStatus(fullTimeBetStatus);
        }

        return new GoalModel();
    }

    private static GoalModel HomeTeamFirstGoal(string[] goalValue)
    {
        if (goalValue[0].Equals("1"))
        {
            if (goalValue[1].Equals("0"))
            {
                return new GoalModel { Home = FirstGoal };
            }

            return goalValue[1].Equals("1")
                ? new GoalModel { Home = FirstLastGoal }
                : new GoalModel { Away = LastGoal, Home = FirstGoal };
        }

        return new GoalModel();
    }

    private static GoalModel HomeTeamLastGoal(string[] goalValue, GoalModel goalIcon)
    {
        if (goalValue[0].Equals("2"))
        {
            if (goalValue[1].Equals("0"))
            {
                return new GoalModel { Away = FirstGoal };
            }

            return goalValue[1].Equals("1")
                ? new GoalModel { Away = FirstGoal, Home = LastGoal }
                : new GoalModel { Away = FirstLastGoal };
        }

        return goalIcon;
    }

    public virtual GoalModel CreateGoalIconModelOnBetStatus(string betStatus)
    {
        var goalValue = betStatus.Split('-');

        var goalIcon = HomeTeamFirstGoal(goalValue);
        return HomeTeamLastGoal(goalValue, goalIcon);
    }

    public GoalModel GetHalftimeGoalByGoalRecord(string goalRecord)
    {
        var indexSemicolon = goalRecord.IndexOf(';');
        var goal = new GoalModel();

        if (indexSemicolon <= -1)
        {
            return goal;
        }

        var halfTimeGoalRecord = goalRecord[..indexSemicolon];
        const StringComparison comparisonType = StringComparison.CurrentCultureIgnoreCase;
        if (halfTimeGoalRecord.StartsWith("a", comparisonType) && halfTimeGoalRecord.EndsWith("a", comparisonType))
        {
            goal.Away = HtFirstLastGoal;
            return goal;
        }

        if (halfTimeGoalRecord.StartsWith("h", comparisonType) && halfTimeGoalRecord.EndsWith("h", comparisonType))
        {
            goal.Home = HtFirstLastGoal;
            return goal;
        }
        if (halfTimeGoalRecord.StartsWith("a", comparisonType) && halfTimeGoalRecord.EndsWith("h", comparisonType))
        {
            goal.Away = HtFirstGoal;
            goal.Home = HtLastGoal;
            return goal;
        }
        if (halfTimeGoalRecord.StartsWith("h", comparisonType) && halfTimeGoalRecord.EndsWith("a", comparisonType))
        {
            goal.Home = HtFirstGoal;
            goal.Away = HtLastGoal;
            return goal;
        }
        return goal;
    }

    public GoalModel GetFullTimeGoalByGoalRecord(string goalRecord, bool isFinalScore)
    {
        var fullTimeGoalRecord = goalRecord.Replace(";", string.Empty);
        var goal = new GoalModel();
        const StringComparison comparisonType = StringComparison.CurrentCultureIgnoreCase;
        if (fullTimeGoalRecord.StartsWith("a", comparisonType))
        {
            goal.Away = FirstGoal;
        }

        if (fullTimeGoalRecord.StartsWith("h", comparisonType))
        {
            goal.Home = FirstGoal;
        }

        if (!isFinalScore)
        {
            return goal;
        }

        if (fullTimeGoalRecord.EndsWith("a", comparisonType))
        {
            goal.Away = string.IsNullOrWhiteSpace(goal.Away) ? LastGoal : FirstLastGoal;
        }

        if (fullTimeGoalRecord.EndsWith("h", comparisonType))
        {
            goal.Home = string.IsNullOrWhiteSpace(goal.Home) ? LastGoal : FirstLastGoal;
        }

        return goal;
    }
}