using Fanex.Data.Repository;

namespace Settlement.Gaming.Criteria.Happy5;

public class GetBallCriteria : CriteriaBase
{
    public string MatchIds { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_MatchSel_BingoBall";
    }

    public override bool IsValid()
    {
        return !string.IsNullOrWhiteSpace(MatchIds);
    }
}