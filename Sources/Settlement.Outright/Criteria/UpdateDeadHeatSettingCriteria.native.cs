using Fanex.Data.Repository;

namespace Settlement.Outright.Criteria;

public class UpdateDeadHeatSettingCriteria : NonQueryCommand
{
    public int LeagueId { get; set; }

    public int AdminId { get; set; }

    public bool DeadHeat { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_DeadHeatLeagueUpd";
    }

    public override bool IsValid()
    {
        return LeagueId > 0;
    }
}