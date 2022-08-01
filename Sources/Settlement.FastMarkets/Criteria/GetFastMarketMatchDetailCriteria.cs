using Fanex.Data.Repository;

namespace Settlement.FastMarkets.Criteria
{
    public class GetFastMarketMatchDetailCriteria : CriteriaBase
    {
        public int MatchId { get; set; }

        public string ResourcesOutPut { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_FastMarket_MatchSelDetail";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}