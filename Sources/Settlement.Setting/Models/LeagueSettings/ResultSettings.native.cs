namespace Settlement.Setting.Models.LeagueSettings;

public class ResultSettings
{
    public bool HasTrader { get; set; }

    public int MinimumProvider { get; set; }

    public string SecondaryProvider { get; set; }

    public string PrimaryProvider { get; set; }

    public string InactiveProvider { get; set; }

    public int WaitingTime { get; set; }
}