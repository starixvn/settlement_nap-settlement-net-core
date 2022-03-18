using Fanex.Data.Repository;

namespace Settlement.FastMarkets.Criteria
{
    public class GetTimeMachineResultCriteria : CriteriaBase
    {
        public int MatchId { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_FastMarket_GoalSequenceSel";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}