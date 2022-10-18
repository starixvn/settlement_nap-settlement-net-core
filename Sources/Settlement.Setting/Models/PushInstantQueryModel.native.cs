namespace Settlement.Setting.Models
{
    public class PushInstantQueryModel
    {
        public int AdminId { get; set; }

        public int MatchId { get; set; }

        public int InstantKey { get; set; }

        public string HomeScore { get; set; }

        public string AwayScore { get; set; }

        public bool IsHalfTime { get; set; }

        public string Mode => IsHalfTime ? "INST-HT" : "INST-FT";

        public string Action { get; set; }

        public string Ip { get; set; }

        public bool IsExistHtFgNg { get; set; }

        public bool IsExistFgNg { get; set; }

        public bool IsExistHtFgLg { get; set; }

        public bool IsExistFgLg { get; set; }

        public string GoalRecord { get; set; }

        public string FirstGoalValue { get; set; }
    }
}