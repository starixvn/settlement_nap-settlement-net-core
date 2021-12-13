using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface IBetStatusAllService
    {
        string GetBetStatus(SettleRequest singleQuery);
    }

    public class BetStatusAllServiceImp : IBetStatusAllService
    {
        private readonly IValidationService validationService;
        private readonly IGoalRecordService goalRecordService;

        public BetStatusAllServiceImp(
            IValidationService validationService,
            IGoalRecordService goalRecordService)
        {
            this.validationService = validationService;
            this.goalRecordService = goalRecordService;
        }

        public string GetBetStatus(SettleRequest singleQuery)
        {
            if (validationService.IsNullScoreAndGoalRecord(singleQuery))
            {
                return NoGoal(singleQuery);
            }
            else if (validationService.HasFinalScoreAndGoalRecord(singleQuery))
            {
                return WithSemicolon(singleQuery);
            }
            else
            {
                return string.Empty;
            }
        }

        private string NoGoal(SettleRequest singleQuery)
        {
            var goalRecord = new GoalRecordModel
            {
                IsExistFgLg = singleQuery.IsExistFgLg,
                IsExistHtFgLg = singleQuery.IsExistHtFgLg,
                FirstGoal = "0",
                LastGoal = "0"
            };

            return goalRecord.BetStatus;
        }

        private string WithSemicolon(SettleRequest singleQuery)
        {
            var halfTimeBetStatus = BetStatusHalftimeWithSemicolon(singleQuery);
            var fullTimeBetStatus = BetStatusFullTimeWithSemicolon(singleQuery);

            return $"{halfTimeBetStatus}{fullTimeBetStatus}";
        }

        private string BetStatusHalftimeWithSemicolon(SettleRequest singleQuery)
        {
            var goalRecord = new GoalRecordModel { IsExistHtFgLg = singleQuery.IsExistHtFgLg };
            var goal = singleQuery.GoalRecord.Split(';')[0];
            goalRecord = goalRecordService.GoalRecordWithSemicolon(goalRecord, goal);

            return goalRecord.HalftimeBetStatus;
        }

        private string BetStatusFullTimeWithSemicolon(SettleRequest singleQuery)
        {
            var goalRecord = new GoalRecordModel { IsExistFgLg = singleQuery.IsExistFgLg };
            var goal = singleQuery.GoalRecord.Replace(";", string.Empty);
            goalRecord = goalRecordService.GoalRecordWithSemicolon(goalRecord, goal);

            return goalRecord.FullTimeBetStatus;
        }
    }
}