using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criteria
{
    internal class BetDaqCheckingCriteria : CriteriaBase
    {
        public int MatchId { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_BetDaq_Checking";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}