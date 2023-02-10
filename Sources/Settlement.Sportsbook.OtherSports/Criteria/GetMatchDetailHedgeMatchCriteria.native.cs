using Fanex.Data.Repository;

namespace Settlement.Sportsbook.OtherSports.Criteria;

public class GetMatchDetailHedgeMatchCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_MatchSelHedge";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}