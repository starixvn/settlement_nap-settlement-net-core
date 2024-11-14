using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria;


public interface AutoSettleRunUpdateCriteria : INonQueryCommand
{
    int ErrCode { get; set; }
    string ErrMsg { get; set; }
    string UpdatedMatchIDs { get; set; } // out
}


public class LeagueAutoSettleRunUpdateCriteria : AutoSettleRunUpdateCriteria
{
    public short AutoType { get; set; }
    public bool IsEnabled { get; set; }
    public bool IsApplyAll { get; set; }
    public int AdminId { get; set; }
    public string Ip { get; set; }
    public int ErrCode { get; set; }
    public string ErrMsg { get; set; }
    public string UpdatedMatchIDs { get; set; } // out
    public int LeagueId { get; set; }
    public string GetSettingKey() => "NAP_Set_AutoPayout_SettingLeagueUpd";
    public bool IsValid() => true;
}


public class MatchAutoSettleRunUpdateCriteria : AutoSettleRunUpdateCriteria
{
    public short AutoType { get; set; }
    public bool IsEnabled { get; set; }
    public bool IsApplyAll { get; set; }
    public int AdminId { get; set; }
    public string Ip { get; set; }
    public int ErrCode { get; set; }
    public string ErrMsg { get; set; }
    public int MatchId { get; set; }

    [SpParam(Ignored = true)]
    public string UpdatedMatchIDs { get; set; } // out

    public string GetSettingKey() => "NAP_Set_AutoPayout_SettingMatchUpd";
    public bool IsValid() => true;
}