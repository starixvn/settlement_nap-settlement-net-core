using Fanex.Data;
using Fanex.Data.Repository;
using System;

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

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        [SpParam(Ignored = true)]
        public string SpName { get; } = "NAP_Admin_Settlement_Refund_MP_Push";

        public string BroadcastSessionId { get; set; } = Guid.NewGuid().ToString();

        public override string GetSettingKey()
        {
            return $"RefundParlay_{DbServer}";
        }

        public override bool IsValid()
        {
            return AdminId > 0 && MatchId > 0;
        }
    }
}