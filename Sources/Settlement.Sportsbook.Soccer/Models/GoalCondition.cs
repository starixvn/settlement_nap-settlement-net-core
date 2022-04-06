namespace Settlement.Sportsbook.Soccer.Models
{
    public class GoalCondition
    {
        private string goalRecord;

        public string GoalRecord
        {
            get
            {
                return string.IsNullOrWhiteSpace(goalRecord)
                    ? string.Empty
                    : goalRecord.ToUpperInvariant();
            }
            set
            {
                goalRecord = value;
            }
        }

        public bool IsExistHtFgLg { get; set; }

        public bool IsExistFgLg { get; set; }

        public bool IsExistFgNg { get; set; }

        public bool IsEnabledGoalRecordHt { get; set; }

        public bool IsEnabledGoalRecordFt { get; set; }
    }
}