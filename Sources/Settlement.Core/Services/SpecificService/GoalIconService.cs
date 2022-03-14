using System.Collections.Generic;
using Settlement.Core.Models;

namespace Settlement.Core.Services
{
    public interface IGoalIconService
    {
        List<Match> GetGoalIconMatches(List<Match> matches);

        GoalIcon GetGoalIcon(GoalIconQueryModel query);
    }

    public class GoalIconServiceImp : IGoalIconService
    {
        private readonly IFirstGoalLastGoalService firstGoalLastGoalService;

        private readonly IRefDataService refDataService;

        public GoalIconServiceImp(IFirstGoalLastGoalService firstGoalLastGoalService, IRefDataService refDataService)
        {
            this.firstGoalLastGoalService = firstGoalLastGoalService;
            this.refDataService = refDataService;
        }

        public List<Match> GetGoalIconMatches(List<Match> matches)
        {
            foreach (var match in matches)
            {
                var query = Query(match);
                match.RefDataService = refDataService;
                match.GoalIcon = GetGoalIcon(query);
            }

            return matches;
        }

        private GoalIconQueryModel Query(Match sportsbook)
        {
            return new GoalIconQueryModel
            {
                BetStatus = sportsbook.BetStatus,
                GoalRecord = sportsbook.GoalRecord,
                FinalAwayScore = sportsbook.FinalAwayScore,
                FinalHomeScore = sportsbook.FinalHomeScore,
                IsExistFgLg = sportsbook.IsExistFgLg,
                IsExistHtFgLg = sportsbook.IsExistHtFgLg
            };
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