using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus
{
    public interface IScoreAndGoalService
    {
        string ReplaceBetStatusWhenScoreAndGoalRecordIsNull(string betStatus);

        string BetStatusHasFinalScoreAndGoalRecord(SettleRequest request);
    }

    public class ScoreAndGoalServiceImp : IScoreAndGoalService
    {
        private readonly IHalftimeFullTimeService halftimeFullTimeService;
        private readonly IFirstGoalLastGoalService firstGoalLastGoalService;

        public ScoreAndGoalServiceImp(IHalftimeFullTimeService halftimeFullTimeService, IFirstGoalLastGoalService firstGoalLastGoalService)
        {
            this.halftimeFullTimeService = halftimeFullTimeService;
            this.firstGoalLastGoalService = firstGoalLastGoalService;
        }

        public string ReplaceBetStatusWhenScoreAndGoalRecordIsNull(string betStatus)
        {
            var isExistHalfTimeFirstGoalLastGoal = betStatus.IgnoreCaseContains("1FL");
            return isExistHalfTimeFirstGoalLastGoal
                ? firstGoalLastGoalService.FirstGoalOnBetStatus(betStatus)
                : firstGoalLastGoalService.LastGoalOnBetStatus(betStatus);
        }

        public string BetStatusHasFinalScoreAndGoalRecord(SettleRequest request)
        {
            var halfTimeBetStatus = string.Empty;
            var fullTimeBetStatus = string.Empty;

            if (request.IsExistHtFgLg)
            {
                halfTimeBetStatus = halftimeFullTimeService.HalfTimeBetStatus(request);
            }

            if (request.IsExistFgLg)
            {
                fullTimeBetStatus = halftimeFullTimeService.FullTimeBetStatus(request, halfTimeBetStatus);
            }

            return $"{halfTimeBetStatus}{fullTimeBetStatus}";
        }
    }
}