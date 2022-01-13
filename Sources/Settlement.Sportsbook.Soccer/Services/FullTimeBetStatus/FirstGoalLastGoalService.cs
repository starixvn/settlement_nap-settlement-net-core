using Kaden.Extensions;

namespace Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus
{
    public interface IFirstGoalLastGoalService
    {
        string FirstGoalOnBetStatus(string betStatus);

        string LastGoalOnBetStatus(string betStatus);
    }

    public class FirstGoalLastGoalServiceImp : IFirstGoalLastGoalService
    {
        private readonly IGoalRecordService goalRecordService;

        public FirstGoalLastGoalServiceImp(IGoalRecordService goalRecordService)
        {
            this.goalRecordService = goalRecordService;
        }

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
}