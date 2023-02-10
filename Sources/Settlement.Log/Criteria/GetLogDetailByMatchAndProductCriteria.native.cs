using Fanex.Data.Repository;

namespace Settlement.Log.Criteria;

public class GetLogDetailByMatchAndProductCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public string ProductType { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_UserLog_Settle_MatchSelByID_by_Product";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}