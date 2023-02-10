using Fanex.Data.Repository;

namespace Settlement.FastMarkets.Criteria;

public class GetMatchDetailCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_MatchSelInfo_Auto_1s";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}