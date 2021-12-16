using Fanex.Data.Repository;

namespace Settlement.Sportsbook.OtherSports.Criteria
{
    public class CalculateCriteria : NonQueryCommand
    {
        public int AdminId { get; set; }

        public int MatchId { get; set; }

        public int? FullTimeHome { get; set; }

        public int? FullTimeAway { get; set; }

        public int HalfTimeHome { get; set; }

        public int HalfTimeAway { get; set; }

        public string GoalRecord { get; set; }

        public string BetStatus { get; set; }

        public string ResourceResult { get; set; }

        public string Action { get; set; }

        public string Ip { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public string ServiceCommand { get; set; }

        public string SelectedQuarter { get; set; }

        public string QuarterResult { get; set; }

        public bool IsReSettledTickets { get; set; } = true;

        public int? RefResultStatus { get; set; }

        public override bool IsValid()
        {
            return AdminId > 0 && MatchId > 0;
        }

        public override string GetSettingKey()
        {
            return "Calculate";
        }
    }
}