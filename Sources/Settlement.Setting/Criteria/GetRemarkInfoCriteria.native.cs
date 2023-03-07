using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria;

public class GetRemarkInfoCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_AutoPayout_MatchSelDetail";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}