namespace Settlement.Setting.Criteria;

public class UpdateTimeSettingLeagueCriteria : NonQueryCommand
{
    public int LeagueId { get; set; }

    public int AutoType { get; set; }

    public int WaitingTime { get; set; }

    public int AdminId { get; set; }

    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_WaitingTimeLeagueUpd";
    }

    public override bool IsValid()
    {
        return LeagueId > 0;
    }
}