using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criterias
{
    public class CheckStatusCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public string Action { get; set; }

        public bool IsSettleAbandonedMatchIBC { get; set; }

        public bool IsSettleDetermined { get; set; }

        public bool IsEarly { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_SettlementStatusChecking";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}