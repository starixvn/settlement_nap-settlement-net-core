namespace Settlement.Sportsbook.Soccer.Criteria;

public class GetOutsideResultsCriteria : CriteriaBase
{
    public int MatchId { get; set; }
    public override string GetSettingKey() => "NAP_Set_ProviderExternalResultDetailLatestInfoSel";

    public override bool IsValid() => true;
}
