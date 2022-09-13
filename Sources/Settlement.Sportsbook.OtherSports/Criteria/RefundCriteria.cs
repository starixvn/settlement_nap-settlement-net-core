using Fanex.Data;
using Fanex.Data.Repository;
using Settlement.Core.Constants;
using System;

namespace Settlement.Sportsbook.OtherSports.Criteria
{
    public class RefundCriteria : NonQueryCommand
    {
        private string betStatus;

        public int MatchId { get; set; }

        public int AdminId { get; set; }

        public string Ip { get; set; }

        [SpParam(Ignored = true)]
        public string Action { get; set; }

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        [SpParam(Ignored = true)]
        public string SpName { get => Action == ActionType.RefundFullTime ? "NAP_Admin_Settlement_RefundFT_Push" : "NAP_Admin_Settlement_Refund_All_Push"; }

        public string BroadcastSessionId { get; } = Guid.NewGuid().ToString();

        public string BetStatus
        {
            get {
                return Action == ActionType.RefundFullTime ? betStatus : null;
            }
            set {
                betStatus = value;
            }
        }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public override string GetSettingKey() => Action == ActionType.RefundFullTime ? $"RefundFT_{DbServer}" : $"RefundAll_{DbServer}";

        public override bool IsValid() => MatchId > 0;
    }
}