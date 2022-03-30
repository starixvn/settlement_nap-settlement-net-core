using Fanex.Data;
using Fanex.Data.Repository;
using Kaden.Extensions;
using Settlement.Sportsbook.Soccer.Constants;

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

        public override string GetSettingKey()
        {
            if (ActionName.IgnoreCaseEquals(ActionType.BetDaq))
            {
                return "NAP_Admin_Settlement_Refund_BetDaq";
            }

            return "NAP_Admin_Settlement_Refund_BetFair";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}