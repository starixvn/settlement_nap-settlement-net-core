namespace Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus;

public interface FirstLastGoalService
{
    string FirstGoalOnBetStatus(string betStatus);

    string LastGoalOnBetStatus(string betStatus);
}

public class FirstLastGoalServiceImp(IGoalRecordService goalRecordService) : FirstLastGoalService
{
    public string FirstGoalOnBetStatus(string betStatus)
    {
        var indexFullTime = betStatus.IgnoreCaseIndexOf(";FL");
        if (indexFullTime > -1)
        {
            var fullTimeValue = betStatus.Substring(indexFullTime + 1, 7);
            return betStatus.Replace(fullTimeValue, goalRecordService.NoGoalFullTime);
        }

        return $"{betStatus}{goalRecordService.NoGoalFullTime}";
    }

    public string LastGoalOnBetStatus(string betStatus)
    {
        var indexFullTime = betStatus.IgnoreCaseIndexOf("FL");
        if (indexFullTime > -1)
        {
            var fullTimeValue = betStatus.Substring(indexFullTime, 7);
            return betStatus.Replace(fullTimeValue, goalRecordService.NoGoalFullTime);
        }

        return $"{betStatus}{goalRecordService.NoGoalFullTime}";
    }
}