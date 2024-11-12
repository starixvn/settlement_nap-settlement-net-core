using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria;

public class UpdateAutoSettleRunningBase
{
    public short AutoType { get; set; }
    public bool IsEnabled { get; set; }
    public bool IsApplyAll { get; set; }
    public int AdminId { get; set; }
    public string Ip { get; set; }
    public int ErrCode { get; set; }
    public string ErrMsg { get; set; }
}


public class UpdateLeagueAutoSettleRunningCriteria : UpdateAutoSettleRunningBase, INonQueryCommand
{
    public int LeagueId { get; set; }
    public string UpdatedMatchIDs { get; set; } // out
    public string GetSettingKey() => "NAP_Set_AutoPayout_SettingLeagueUpd";
    public bool IsValid() => true;
}


public class UpdateMatchAutoSettleRunningCriteria : UpdateAutoSettleRunningBase, INonQueryCommand
{
    public int MatchId { get; set; }
    public string GetSettingKey() => "[NAP_Set_AutoPayout_SettingMatchUpd]";
    public bool IsValid() => true;
}