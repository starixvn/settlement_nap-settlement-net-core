using Fanex.Data.Repository;

namespace Settlement.Core.Criteria;

public class GetBalanceUpDayCriteria : CriteriaBase
{
    public override string GetSettingKey()
    {
        return "NAP_SelBalanceUpDay";
    }

    public override bool IsValid()
    {
        return true;
    }
}