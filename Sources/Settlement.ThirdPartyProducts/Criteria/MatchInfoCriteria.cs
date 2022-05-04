using Fanex.Data.Repository;

namespace Settlement.ThirdPartyProducts.Criteria
{
    public class MatchInfoCriteria : CriteriaBase
    {
        public int MatchId { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_MatchSelInfo_by_Vendor";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}