using Fanex.Data.Repository;

namespace Settlement.Outright.Criteria;

public class GetOutrightLeaguesCriteria : CriteriaBase
{
    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public int SportType { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_LeagueSelOutright";
    }

    public override bool IsValid()
    {
        return FromDate <= ToDate;
    }
}