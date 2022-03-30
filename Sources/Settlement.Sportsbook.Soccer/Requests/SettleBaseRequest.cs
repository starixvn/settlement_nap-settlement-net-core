namespace Settlement.Sportsbook.Soccer.Requests
{
    public class SettleBaseRequest
    {
        private string goalRecord;

        private string betStatus;

        public int MatchId { get; set; }

        public int AdminId { get; set; }

        public string ActionName { get; set; }

        public int? HalfTimeHomeScore { get; set; }

        public int? FinalHomeScore { get; set; }

        public int? HalfTimeAwayScore { get; set; }

        public int? FinalAwayScore { get; set; }

        public bool IsEnabledGoalRecordHt { get; set; }

        public bool IsEnabledGoalRecordFt { get; set; }

        public bool IsExistFgLg { get; set; }

        public bool IsExistHtFgLg { get; set; }

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

        public string BetStatus
        {
            get => betStatus ?? string.Empty;
            set => betStatus = value;
        }

        public int HedgeMatchId { get; set; }

        public bool IsApplyHedging { get; set; }
    }
}