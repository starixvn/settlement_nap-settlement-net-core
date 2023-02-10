using Fanex.Data.Repository;

namespace Settlement.Gaming.Criteria.NumberGame;

public class GetMatchDetailCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_MatchSelNumberGameDetail";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}