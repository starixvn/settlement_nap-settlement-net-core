using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus;

public interface IBetStatusService
{
    string GetBetStatus(SettleRequest request);
}

public class BetStatusServiceImp(IValidationService validationService, IScoreAndGoalService scoreAndGoalService)
    : IBetStatusService
{
    public string GetBetStatus(SettleRequest request)
    {
        if (validationService.IsNullScoreAndGoalRecord(request))
        {
            return scoreAndGoalService.ReplaceBetStatusWhenScoreAndGoalRecordIsNull(request.BetStatus);
        }

        return validationService.HasFinalScoreAndSemicolonOnGoalRecord(request)
            ? scoreAndGoalService.BetStatusHasFinalScoreAndGoalRecord(request)
            : string.Empty;
    }
}