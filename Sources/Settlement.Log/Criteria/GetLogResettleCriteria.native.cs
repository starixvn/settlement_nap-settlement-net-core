using Fanex.Data.Repository;

namespace Settlement.Log.Criteria;

public class GetLogResettleCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public int SportType { get; set; }

    public override string GetSettingKey() => "NAP_SettlementLog_SelReSettle";

    public override bool IsValid() => MatchId > 0;
}