using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria.ProviderManager
{
    public class GetProviderCriteria : CriteriaBase
    {
        public int GameTypes { get; set; }

        public int SourceType { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_ProviderInfoSel";
        }

        public override bool IsValid()
        {
            return GameTypes > 0;
        }
    }
}