using Fanex.Data.Repository;

namespace Settlement.Log.Criteria;

public class GetPlayerInfoCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public override string GetSettingKey() => "NAP_Set_PlayerInfoSel";

    public override bool IsValid() => MatchId > 0;
}