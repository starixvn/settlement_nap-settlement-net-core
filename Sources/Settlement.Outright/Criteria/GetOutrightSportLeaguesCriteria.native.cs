using Fanex.Data.Repository;

namespace Settlement.Outright.Criteria;

public class GetOutrightSportLeaguesCriteria : CriteriaBase
{
    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_LeagueSelOutright";
    }

    public override bool IsValid()
    {
        return FromDate <= ToDate;
    }
}