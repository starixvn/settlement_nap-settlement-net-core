using Settlement.Sportsbook.Soccer.Models;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface IGoalIconService
    {
        GoalIcon GetGoalIcon(GoalIconQueryModel query);
    }

    public class GoalIconServiceImp : IGoalIconService
    {
        private readonly IFirstGoalLastGoalService firstGoalLastGoalService;

        public GoalIconServiceImp(IFirstGoalLastGoalService firstGoalLastGoalService)
        {
            this.firstGoalLastGoalService = firstGoalLastGoalService;
        }

        public GoalIcon GetGoalIcon(GoalIconQueryModel query)
        {
            var goalIcon = new GoalIcon();

            if (string.IsNullOrWhiteSpace(query.BetStatus) && string.IsNullOrWhiteSpace(query.GoalRecord))
            {
                return goalIcon;
            }

            if (query.IsExistHtFgLg)
            {
                var halfTimeGoal = !string.IsNullOrWhiteSpace(query.BetStatus)
                    ? firstGoalLastGoalService.GetHalftimeGoalByBetStatus(query)
                    : firstGoalLastGoalService.GetHalftimeGoalByGoalRecord(query.GoalRecord);

                goalIcon.HalfTimeHomeGoal = halfTimeGoal.Home;
                goalIcon.HalfTimeAwayGoal = halfTimeGoal.Away;
            }

            if (query.IsExistFgLg)
            {
                var isSettled = query.FinalAwayScore != null && query.FinalHomeScore != null;
                var fullTimeGoal = !string.IsNullOrWhiteSpace(query.BetStatus)
                    ? firstGoalLastGoalService.GetFullTimeGoalByBetStatus(query)
                    : firstGoalLastGoalService.GetFullTimeGoalByGoalRecord(query.GoalRecord, isSettled);

                goalIcon.HomeGoal = fullTimeGoal.Home;
                goalIcon.AwayGoal = fullTimeGoal.Away;
            }

            return goalIcon;
        }
    }
}