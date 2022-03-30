using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criteria
{
    internal class BetFairCheckingCriteria : CriteriaBase
    {
        public int MatchId { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_BetFair_Checking";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}