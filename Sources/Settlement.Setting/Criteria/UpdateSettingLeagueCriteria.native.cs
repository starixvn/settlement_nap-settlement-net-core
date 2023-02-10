using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria;

public class UpdateSettingLeagueCriteria : NonQueryCommand
{
    public int AdminId { get; set; }

    public int LeagueId { get; set; }

    public int AutoType { get; set; }

    public bool IsEnabled { get; set; }

    public bool IsApplyAll { get; set; }

    public string UpdatedMatchIds { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public string Ip { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_AutoPayout_SettingLeagueUpd";
    }

    public override bool IsValid()
    {
        return LeagueId > 0;
    }
}