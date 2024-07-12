namespace Settlement.EventManagement.Models.Calculation;

[MessagePackObject]
public class League
{
    [Key("leagueId")]
    public int LeagueId { get; set; }

    [Key("name")]
    public string Name { get; set; }

    [Key("directWaitingTime")]
    public int DirectWaitingTime { get; set; }

    [Key("instantWaitingTime")]
    public int InstantWaitingTime { get; set; }

    [Key("refundWaitingTime")]
    public int RefundWaitingTime { get; set; }


    [Key("autoCalcSetting")]
    public AutoCalculationSetting AutoCalcSetting { get; set; } = new();

    [Key("matches")]
    public List<Match> Matches { get; set; } = new();
}