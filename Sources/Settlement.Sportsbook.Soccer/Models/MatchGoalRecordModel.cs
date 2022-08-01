
namespace Settlement.Sportsbook.Soccer.Models
{
    public class MatchGoalRecordModel
    {
        public bool IsExistHtFgNg { get; set; }

        public bool IsExistFgNg { get; set; }

        public string GoalRecord { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }
    }
}
