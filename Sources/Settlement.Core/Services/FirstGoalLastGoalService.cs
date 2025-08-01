namespace Settlement.Core.Services;

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
    private const char CharA = 'a';
    private const char CharH = 'h';
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
        if (string.IsNullOrEmpty(goalRecord))
        {
            return new GoalModel();
        }

        var halfTimeGoalRecord = ExtractHalfTimeGoalRecord(goalRecord);
        return string.IsNullOrEmpty(halfTimeGoalRecord)
            ? new GoalModel()
            : ParseHalfTimeGoalPattern(halfTimeGoalRecord);
    }

    private static string ExtractHalfTimeGoalRecord(string goalRecord)
    {
        var semicolonIndex = goalRecord.IndexOf(';');
        return semicolonIndex > 0 ? goalRecord[..semicolonIndex].ToLowerInvariant() : string.Empty;
    }

    private static GoalModel ParseHalfTimeGoalPattern(string halfTimeGoalRecord)
    {
        var startsWithA = halfTimeGoalRecord.StartsWith(CharA);
        var startsWithH = halfTimeGoalRecord.StartsWith(CharH);
        var endsWithA = halfTimeGoalRecord.EndsWith(CharA);
        var endsWithH = halfTimeGoalRecord.EndsWith(CharH);

        return (startsWithA, startsWithH, endsWithA, endsWithH) switch
        {
            (true, false, true, false) => new GoalModel { Away = HtFirstLastGoal },
            (false, true, false, true) => new GoalModel { Home = HtFirstLastGoal },
            (true, false, false, true) => new GoalModel { Home = HtLastGoal, Away = HtFirstGoal },
            (false, true, true, false) => new GoalModel { Home = HtFirstGoal, Away = HtLastGoal },
            _ => new GoalModel()
        };
    }

    public GoalModel GetFullTimeGoalByGoalRecord(string goalRecord, bool isFinalScore)
    {
        var fullTimeGoalRecord = goalRecord.Replace(";", string.Empty).ToLowerInvariant();
        var goal = new GoalModel();
        var startsWithA = fullTimeGoalRecord.StartsWith(CharA);
        var startsWithH = fullTimeGoalRecord.StartsWith(CharH);
        var endsWithA = fullTimeGoalRecord.EndsWith(CharA);
        var endsWithH = fullTimeGoalRecord.EndsWith(CharH);

        if (startsWithA)
        {
            goal.Away = FirstGoal;
        }

        if (startsWithH)
        {
            goal.Home = FirstGoal;
        }

        if (!isFinalScore)
        {
            return goal;
        }

        if (endsWithA)
        {
            goal.Away = string.IsNullOrWhiteSpace(goal.Away) ? LastGoal : FirstLastGoal;
        }

        if (endsWithH)
        {
            goal.Home = string.IsNullOrWhiteSpace(goal.Home) ? LastGoal : FirstLastGoal;
        }

        return goal;
    }
}