using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criteria;

public class GetLastestMatchDetailCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_MatchSelDetail_ReCal";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}