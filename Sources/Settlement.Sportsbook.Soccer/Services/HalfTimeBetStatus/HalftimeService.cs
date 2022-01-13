using Kaden.Extensions;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services.HalfTimeBetStatus
{
    public interface IHalftimeService
    {
        string GetBetStatusForCalculateHalfTime(SettleRequest request);

        string ApplyNewBetStatusForHalfTime(string oldBetStatus, string halfTimeBetStatus);
    }

    public class HalftimeServiceImp : IHalftimeService
    {
        private readonly IValidationService validationService;
        private readonly IHalftimeScoreAndGoalService halftimeScoreAndGoalService;

        public HalftimeServiceImp(IValidationService validationService, IHalftimeScoreAndGoalService halftimeScoreAndGoalService)
        {
            this.validationService = validationService;
            this.halftimeScoreAndGoalService = halftimeScoreAndGoalService;
        }

        public string GetBetStatusForCalculateHalfTime(SettleRequest request)
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

        public string ApplyNewBetStatusForHalfTime(string oldBetStatus, string halfTimeBetStatus)
        {
            if (string.IsNullOrEmpty(oldBetStatus) || !oldBetStatus.IgnoreCaseContains("1FL"))
            {
                return $"{halfTimeBetStatus}{oldBetStatus}";
            }

            return halftimeScoreAndGoalService.HasFirstGoalOnBetStatus(oldBetStatus, halfTimeBetStatus);
        }
    }
}