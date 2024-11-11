using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria;

public class AutoSettleMatchSettingSelCriteria : ICriteria
{
    public int LeagueId { get; set; }
    public int MatchId { get; set; }
    public short SportType { get; set; }
    public byte AutoType { get; set; } = 6;

    public string GetSettingKey() => "NAP_Set_AutoPayout_MatchSetting_Sel";

    public bool IsValid() => true;
}

public class AutoSettleLeagueSettingSelCriteria : ICriteria
{
    public int LeagueId { get; set; }
    public short SportType { get; set; }
    public byte AutoType { get; set; } = 6;

    public string GetSettingKey() => "NAP_Set_AutoPayout_LeagueSetting_Sel";

    public bool IsValid() => true;
}
