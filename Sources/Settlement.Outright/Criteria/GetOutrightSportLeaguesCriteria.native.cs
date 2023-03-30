using Fanex.Data.Repository;

namespace Settlement.Outright.Criteria;

public class GetOutrightSportLeaguesCriteria : CriteriaBase
{
    public string FromDate { get; set; }

    public string ToDate { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_LeagueSelOutright";
    }

    public override bool IsValid()
    {
        return FromDate is not null;
    }
}