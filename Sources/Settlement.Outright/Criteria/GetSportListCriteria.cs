using Fanex.Data.Repository;

namespace Settlement.Outright.Criteria;

public class GetSportListCriteria : CriteriaBase
{
    public override string GetSettingKey()
    {
        return "NAP_SelSports";
    }

    public override bool IsValid()
    {
        return true;
    }
}