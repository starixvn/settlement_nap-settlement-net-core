namespace Settlement.Core.Models
{
    public class GoalIconQueryModel
    {
        public string GoalRecord { get; set; }

        public string BetStatus { get; set; }

        public bool IsExistFgLg { get; set; }

        public bool IsExistHtFgLg { get; set; }

        public int? FinalHomeScore { get; set; }

        public int? FinalAwayScore { get; set; }
    }
}