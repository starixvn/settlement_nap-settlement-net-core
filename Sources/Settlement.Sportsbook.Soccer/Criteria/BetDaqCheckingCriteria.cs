using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criteria
{
    public class BetDaqCheckingCriteria : CriteriaBase
    {
        public int MatchId { get; set; }

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        public override string GetSettingKey()
        {
            return $"NAP_Set_BetDaq_Checking_{DbServer}";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}