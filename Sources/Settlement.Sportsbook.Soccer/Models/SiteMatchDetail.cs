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
    }
}