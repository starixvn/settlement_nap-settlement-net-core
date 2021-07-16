using Fanex.Data.Repository;

namespace Settlement.Sportsbook.OtherSports.Criteria
{
    public class ParlayCriteria : NonQueryCommand
    {
        public int AdminId { get; set; }

        public int MatchId { get; set; }

        public string Action { get; set; }

        public int SettleAbandonedMatchIbcParlay { get; set; }

        public string Ip { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public override string GetSettingKey()
        {
            return "RefundParlay";
        }

        public override bool IsValid()
        {
            return AdminId > 0 && MatchId > 0;
        }
    }
}