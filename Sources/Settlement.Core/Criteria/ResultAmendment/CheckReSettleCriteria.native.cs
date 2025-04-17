using Fanex.Data.Repository;

namespace Settlement.Core.Criteria;

public class CheckReSettleCriteria : CriteriaBase
{
    public int MatchId { get; set; }
    public string Action { get; set; }
    public string SelectedResources { get; set; }

    public override string GetSettingKey() => "NAP_SettlementLog_CheckReSettle";

    public override bool IsValid() => MatchId > 0;
}