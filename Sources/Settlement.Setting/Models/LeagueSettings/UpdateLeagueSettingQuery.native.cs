namespace Settlement.Setting.Models.LeagueSettings;
public class UpdateLeagueSettingQuery
{
    public int LeagueId { get; set; }

    public byte AutoSetting { get; set; }

    public int RetryTime { get; set; }

    public int WaitingTime { get; set; }

    public ResultSettings MainResultSettings { get; set; }

    public ResultSettings EarlyResultSettings { get; set; }
}
