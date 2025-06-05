using Fanex.Data.Repository;

namespace Settlement.ThirdPartyProducts.Criteria;

public class GetMarketIdsCriteria : CriteriaBase
{
    public int MatchId { get; set; }
    public string SelectionType { get; set; }
    public override string GetSettingKey() => "NAP_Settlement_MarketIDSel";

    public override bool IsValid() => true;
}
