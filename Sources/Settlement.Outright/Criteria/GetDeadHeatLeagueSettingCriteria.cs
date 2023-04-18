using Fanex.Data.Repository;

namespace Settlement.Outright.Criteria;
public class GetDeadHeatLeagueSettingCriteria : CriteriaBase
{
    public int LeagueId { get; set; }

    public override string GetSettingKey() => "NAP_Set_DeadHeatLeagueSel";

    public override bool IsValid() => LeagueId != 0;
}
