using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criteria
{
    public class ValidateBeforePushCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public string Action { get; set; }

        public string Mode { get; set; }

        public bool IsAuto { get; set; } = false;

        public string SelectedResources { get; set; }

        public string SpName { get; set; }

        public int SDTRecord { get; set; }

        public int SettleAbandonedMatchIBCParlay { get; set; }

        public bool IsSettleDetermined { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        public override string GetSettingKey()
        {
            return $"NAP_Admin_Settlement_Validation_Ticket_{DbServer}";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}