using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criteria
{
    public class GetHedgeMatchDeterminedInfo : CriteriaBase
    {
        public int MatchId { get; set; }

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        public override string GetSettingKey() => $"NAP_Set_MatchSelHedge_Ticket_{DbServer}";

        public override bool IsValid() => MatchId > 0;
    }
}

