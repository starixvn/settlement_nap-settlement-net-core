using Fanex.Data.Repository;

namespace Settlement.Sportsbook.OtherSports.Criteria;

public class GetExternalResultCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_ProviderExternalResultDetailLatestInfoSel";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}