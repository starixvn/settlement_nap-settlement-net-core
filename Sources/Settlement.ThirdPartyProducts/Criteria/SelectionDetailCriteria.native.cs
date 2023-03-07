using Fanex.Data.Repository;

namespace Settlement.ThirdPartyProducts.Criteria;

public class SelectionDetailCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public string Resources { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_SMPSelectionDetailSel";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}