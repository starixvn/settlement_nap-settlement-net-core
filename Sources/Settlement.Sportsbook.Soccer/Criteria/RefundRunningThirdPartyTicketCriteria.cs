using Fanex.Data;
using Fanex.Data.Repository;
using Kaden.Extensions;
using Settlement.Core.Constants;

namespace Settlement.Sportsbook.Soccer.Criteria
{
    public class RefundRunningThirdPartyTicketCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public int AdminId { get; set; }

        public string Ip { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        [SpParam(Ignored = true)]
        public string ActionName { get; set; }

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        [SpParam(Ignored = true)]
        public string SpName { get => ActionName.IgnoreCaseEquals(ActionType.BetDaq) ? "NAP_Admin_Settlement_Refund_BetDaq_Push" : "NAP_Admin_Settlement_Refund_BetFair_Push"; } 

        public override string GetSettingKey()
        {
            return ActionName.IgnoreCaseEquals(ActionType.BetDaq) ? $"NAP_Admin_Settlement_Refund_BetDaq_Push_{DbServer}" : $"NAP_Admin_Settlement_Refund_BetFair_Push_{DbServer}";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}