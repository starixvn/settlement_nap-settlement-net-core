using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services.HalfTimeBetStatus;

public interface IHalftimeService
{
    string GetBetStatusForCalculateHalfTime(SettleBaseRequest request);

    string FullTimeBetStatusForCalculateHalfTime(string goalRecord);

    string AppendHalfTimeBetStatus(string oldBetStatus, string halfTimeBetStatus);

    string AppendFullTimeBetStatus(string betStatus, string fullTimeBetStatus);
}

public class HalftimeServiceImp(
    IValidationService validationService,
    IHalftimeScoreAndGoalService halftimeScoreAndGoalService)
    : IHalftimeService
{
    public string GetBetStatusForCalculateHalfTime(SettleBaseRequest request)
    {
        if (validationService.IsNullHalftimeScoreAndGoalRecord(request))
        {
            return halftimeScoreAndGoalService.NoGoalHalftime;
        }

        if (validationService.HasHalftimeScoreWithSemicolonOnGoalRecord(request))
        {
            return halftimeScoreAndGoalService.BetStatusHasHalftimeScoreWithSemicolonOnGoalRecord(request.GoalRecord);
        }

        return validationService.HasHalftimeScoreWithoutSemicolonOnGoalRecord(request)
            ? halftimeScoreAndGoalService.BetStatusHasHalftimeScoreWithoutSemicolonOnGoalRecord(request.GoalRecord)
            : string.Empty;
    }

    public string AppendHalfTimeBetStatus(string oldBetStatus, string halfTimeBetStatus)
    {
        if (string.IsNullOrEmpty(oldBetStatus) || !oldBetStatus.IgnoreCaseContains("1FL"))
        {
            return $"{halfTimeBetStatus}{oldBetStatus}";
        }

        return halftimeScoreAndGoalService.HasFirstGoalOnBetStatus(oldBetStatus, halfTimeBetStatus);
    }

    public string FullTimeBetStatusForCalculateHalfTime(string goalRecord)
    {
        if (string.IsNullOrWhiteSpace(goalRecord) ||
            string.IsNullOrWhiteSpace(goalRecord.Replace(";", string.Empty)))
        {
            return string.Empty;
        }

        return halftimeScoreAndGoalService.FullTimeBetStatus(goalRecord);
    }

    public string AppendFullTimeBetStatus(string betStatus, string fullTimeBetStatus)
    {
        var newBetStatus = new List<string>();
        if (IsModifyFirstGoalLastGoal(betStatus, fullTimeBetStatus))
        {
            return fullTimeBetStatus;
        }

        if (!string.IsNullOrWhiteSpace(betStatus))
        {
            var arr = betStatus.Split(';');
            var flag = false;

            foreach (var item in arr)
            {
                switch (flag)
                {
                    case false when item.IgnoreCaseContains("FL") && !item.IgnoreCaseContains("1FL"):
                        flag = true;
                        newBetStatus.Add(fullTimeBetStatus.Replace(";", string.Empty));
                        break;

                    case false when IsModifyFirstGoalLastGoal(item, fullTimeBetStatus):
                        flag = true;
                        newBetStatus.Add(fullTimeBetStatus);
                        break;

                    default:
                        newBetStatus.Add(item);
                        break;
                }
            }
        }

        return string.Join(";", newBetStatus);
    }

    private static bool IsModifyFirstGoalLastGoal(string item, string fullTimeBetStatus)
    {
        return string.IsNullOrWhiteSpace(item) && !string.IsNullOrWhiteSpace(fullTimeBetStatus);
    }
}