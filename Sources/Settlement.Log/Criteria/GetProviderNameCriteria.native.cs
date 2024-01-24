using Fanex.Data.Repository;

namespace Settlement.Log.Criteria;

public class GetProviderNameCriteria : CriteriaBase
{
    public override string GetSettingKey() => "NAP_Set_ProviderSel";

    public override bool IsValid() => true;
}