using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus
{
    public interface IBetStatusService
    {
        string GetBetStatus(SettleRequest request);
    }

    public class BetStatusServiceImp : IBetStatusService
    {
        private readonly IValidationService validationService;
        private readonly IScoreAndGoalService scoreAndGoalService;

        public BetStatusServiceImp(IValidationService validationService, IScoreAndGoalService scoreAndGoalService)
        {
            this.validationService = validationService;
            this.scoreAndGoalService = scoreAndGoalService;
        }

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
}