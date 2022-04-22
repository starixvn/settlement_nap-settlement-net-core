using Fanex.Data;
using Fanex.Data.Repository;
using Settlement.Core.Constants;

namespace Settlement.Sportsbook.OtherSports.Criteria
{
    public class RefundCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public int AdminId { get; set; }

        public string Ip { get; set; }

        [SpParam(Ignored = true)]
        public string Action { get; set; }

        public int? FullTimeHome { get; set; }

        public int? FullTimeAway { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public override string GetSettingKey()
        {
            return Action == ActionType.RefundFullTime ? "RefundFT" : "RefundAll";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}