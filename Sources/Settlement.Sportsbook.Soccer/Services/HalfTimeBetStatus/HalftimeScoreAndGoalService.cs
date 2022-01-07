using Kaden.Extensions;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services.HalfTimeBetStatus
{
    public interface IHalftimeScoreAndGoalService
    {
        string NoGoalHalftime { get; }

        string HasFirstGoalOnBetStatus(string oldBetStatus, string halfTimeBetStatus);

        string BetStatusHasHalftimeScoreWithoutSemicolonOnGoalRecord(string goalRecordValue);

        string BetStatusHasHalftimeScoreWithSemicolonOnGoalRecord(string goalRecordValue);
    }

    public class HalftimeScoreAndGoalServiceImp : IHalftimeScoreAndGoalService
    {
        private readonly IGoalRecordService goalRecordService;

        public HalftimeScoreAndGoalServiceImp(IGoalRecordService goalRecordService)
        {
            this.goalRecordService = goalRecordService;
        }

        public string NoGoalHalftime
        {
            get
            {
                var goalRecord = new GoalRecordModel
                {
                    IsExistHtFgLg = true,
                    FirstGoal = "0",
                    LastGoal = "0"
                };

                return goalRecord.HalftimeBetStatus;
            }
        }

        public string HasFirstGoalOnBetStatus(string oldBetStatus, string halfTimeBetStatus)
        {
            var maxLengthHalfTime = 7;
            if (oldBetStatus.Contains(";"))
            {
                maxLengthHalfTime = maxLengthHalfTime + 1;
            }

            var oldHalfTimeBetStatus = oldBetStatus.Substring(oldBetStatus.IgnoreCaseIndexOf("1FL"), maxLengthHalfTime);
            return oldBetStatus.Replace(oldHalfTimeBetStatus, halfTimeBetStatus);
        }

        public string BetStatusHasHalftimeScoreWithoutSemicolonOnGoalRecord(string goalRecordValue)
        {
            var firstGoal = goalRecordService.HomeOrAwayFirstGoal(goalRecordValue);
            var goalRecord = new GoalRecordModel
            {
                IsExistHtFgLg = true,
                FirstGoal = firstGoal,
                LastGoal = "0"
            };

            return goalRecord.HalftimeBetStatus;
        }

        public string BetStatusHasHalftimeScoreWithSemicolonOnGoalRecord(string goalRecordValue)
        {
            var goal = goalRecordValue.Split(';')[0];
            var goalRecord = new GoalRecordModel { IsExistHtFgLg = true };
            goalRecord = goalRecordService.GoalRecordWithSemicolon(goalRecord, goal);

            return goalRecord.HalftimeBetStatus;
        }
    }
}