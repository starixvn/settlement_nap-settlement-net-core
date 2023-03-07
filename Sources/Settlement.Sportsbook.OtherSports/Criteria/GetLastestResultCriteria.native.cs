using Fanex.Data.Repository;

namespace Settlement.Sportsbook.OtherSports.Criteria;

public class GetLastestResultCriteria : CriteriaBase
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