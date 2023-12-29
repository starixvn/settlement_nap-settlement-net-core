using System.Text.Json.Serialization;

namespace Settlement.Setting.Models.LeagueSettings;
public class LeagueSettings
{
    public int LeagueId { get; set; }

    public int RetryTime { get; set; }

    [JsonIgnore]
    public bool Main_HasTrader { get; set; }

    [JsonIgnore]
    public int Main_NumberProvider { get; set; }

    [JsonIgnore]
    public string Main_PrimaryProvider { get; set; }

    [JsonIgnore]
    public string Main_SecondaryProvider { get; set; }

    [JsonIgnore]
    public bool EAR_HasTrader { get; set; }

    [JsonIgnore]
    public int EAR_NumberProvider { get; set; }

    [JsonIgnore]
    public string EAR_PrimaryProvider { get; set; }

    [JsonIgnore]
    public string EAR_SecondaryProvider { get; set; }

    public string LeagueName { get; set; }

    public List<ProviderInfo> Providers { get; set; }

    public ResultSettings MainResultSettings => new(Main_HasTrader, Main_NumberProvider,
        Main_PrimaryProvider, Main_SecondaryProvider, Providers);

    public ResultSettings EarlyResultSettings =>
        new(EAR_HasTrader, EAR_NumberProvider, EAR_PrimaryProvider, EAR_SecondaryProvider, Providers);
}
