namespace Settlement.EventManagement.Models.MultiSports;

[MessagePackObject]
public class LeagueModel
{
    [Key("leagueId")]
    public int LeagueId { get; set; }

    [Key("name")]
    public string Name { get; set; }

    [Key("autoCalcSetting")]
    public AutoCalculationSetting AutoCalcSetting { get; set; } = new AutoCalculationSetting();

    [Key("autoWaitingTime")]
    public int AutoWaitingTime { get; set; }

    [Key("matches")]
    public List<Match> Matches { get; set; }

    [Key("sportType")]
    public int SportType { get; set; }

    [Key("isMergedParlay")]
    public bool IsMergedParlay
    {
        get
        {
            return Matches.Any(match => match.IsMergedParlay);
        }
    }
}