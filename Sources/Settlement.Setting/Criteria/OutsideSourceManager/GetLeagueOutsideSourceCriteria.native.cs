using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria.OutsideSourceManager;

public class GetLeagueOutsideSourceCriteria : NonQueryCommand
{
    public int LeagueId { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_OutsideSourceByLeagueSel";
    }

    public override bool IsValid()
    {
        return LeagueId > 0;
    }
}