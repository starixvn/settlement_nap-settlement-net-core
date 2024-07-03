using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria.LeagueSettings;
public class GetLeagueSettings : CriteriaBase
{
    public int SportType { get; set; }

    public int LeagueId { get; set; }

    public byte AutoType { get; set; } = 6;
    public override string GetSettingKey() => "NAP_Set_AutoPayout_LeagueSetting_Sel";

    public override bool IsValid() => LeagueId > 0 && SportType > 0;
}
