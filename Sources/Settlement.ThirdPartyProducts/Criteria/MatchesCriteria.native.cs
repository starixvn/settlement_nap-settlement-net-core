using Fanex.Data.Repository;

namespace Settlement.ThirdPartyProducts.Criteria;

public class MatchesCriteria : CriteriaBase
{
    public string MatchCode { get; set; }

    public string Status { get; set; }

    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public string LeagueIds { get; set; }

    public string SportTypes { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_MatchSel_by_Vendor";
    }

    public override bool IsValid()
    {
        return FromDate <= ToDate;
    }
}