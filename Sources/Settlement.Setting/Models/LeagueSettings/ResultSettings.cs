namespace Settlement.Setting.Models.LeagueSettings;
public class ResultSettings(bool hasTrader, int minimumTrader, string primaryTrader, string secondaryTrader)
{
    public bool HasTrader { get; set; } = hasTrader;

    public int MinimumTrader { get; set; } = minimumTrader;

    public string PrimaryTrader { get; set; } = primaryTrader;

    public string SecondaryTrader { get; } = secondaryTrader;
}
