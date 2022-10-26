using Fanex.Data;
using Fanex.Data.Repository;
using Settlement.Core.Constants;

namespace Settlement.Sportsbook.Soccer.Criteria
{
    public class RefundRunningThirdPartyTicketCriteria : NonQueryCommand
    {
        private readonly string betDaqPush = "NAP_Admin_Settlement_Refund_BetDaq_Push";

        private readonly string betFairPush = "NAP_Admin_Settlement_Refund_BetFair_Push";

        public int MatchId { get; set; }

        public int AdminId { get; set; }

        public string Ip { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public string BroadcastSessionId { get; } = Guid.NewGuid().ToString();

        [SpParam(Ignored = true)]
        public string ActionName { get; set; }

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        [SpParam(Ignored = true)]
        public string SpName { get => ActionName.IgnoreCaseEquals(ActionType.BetDaq) ? betDaqPush : betFairPush; }

        public override string GetSettingKey() => ActionName.IgnoreCaseEquals(ActionType.BetDaq) ? $"{betDaqPush}_{DbServer}" : $"{betFairPush}_{DbServer}";

        public override bool IsValid() => MatchId > 0;
    }
}