namespace Settlement.Sportsbook.Soccer.Models
{
    public class SiteMatchDetail
    {
        public bool IsExistResultAndFirstTeamScore { get; set; }

        public string HtStatus { get; set; }

        public string FtStatus { get; set; }

        public bool IsExistFgNg { get; set; }

        public bool IsExistHtFgLg { get; set; }

        public bool IsExistFgLg { get; set; }

        public bool IsHtOnly { get; set; }

        public bool IsEnabledGoalRecordHt { get; set; }

        public bool IsEnabledGoalRecordFt { get; set; }
    }
}