using Fanex.Data.Repository;

namespace Settlement.Sportsbook.OtherSports.Criteria
{
    public class RefundAllCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public int AdminId { get; set; }

        public string Ip { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public bool IsExcludeBetdaq { get; set; }

        public bool IsSettleAbandonedMatch { get; set; }

        public bool IsExcludeBetfair { get; set; }

        public bool IsSettleAbandonedMatchBetFair { get; set; }

        public bool IsSettleAbandonedMatchIbc { get; set; }

        public int? HalfTimeHome { get; set; }

        public int? HalfTimeAway { get; set; }

        public int? FullTimeHome { get; set; }

        public int? FullTimeAway { get; set; }

        public string BetStatus { get; set; }

        public string ResourceResult { get; set; }

        public string GoalSequence { get; set; }

        public string ServiceCommand { get; set; }

        public override string GetSettingKey()
        {
            return "RefundAll";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}