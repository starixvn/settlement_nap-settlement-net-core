namespace Settlement.Sportsbook.Soccer.Models
{
    public class UndoCheckingModel
    {
        public string HomeScore { get; set; }

        public string AwayScore { get; set; }

        public string GoalRecord { get; set; }

        public bool IsHt { get; set; }

        public int InstantKey { get; set; }

        public string FirstGoalValue { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }
    }
}