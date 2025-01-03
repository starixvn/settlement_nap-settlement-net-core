namespace Settlement.EventManagement.Models.MultiSports;

[MessagePackObject]
public class LeagueModel
{
    [Key("leagueId")]
    public int LeagueId { get; set; }

    [Key("name")]
    public string Name { get; set; }

    [Key("autoCalcSetting")]
    public AutoCalculationSetting AutoCalcSetting { get; set; } = new();

    [Key("autoWaitingTime")]
    public int AutoWaitingTime { get; set; }

    [Key("autoEarlyWaitingTime")]
    public int AutoEarlyWaitingTime { get; set; }

    [Key("autoMainWaitingTime")]
    public int AutoMainWaitingTime { get; set; }

    [Key("autoRetryTime")]
    public int AutoRetryTime { get; set; }

    [Key("refundWaitingTime")]
    public int RefundWaitingTime { get; set; }

    [Key("matches")]
    public List<Match> Matches { get; set; }

    [Key("sportType")]
    public int SportType { get; set; }
}