using Newtonsoft.Json;

namespace Settlement.Setting.Models.LeagueSettings;
public class ResultSettings
{
    public ResultSettings(bool hasTrader, int minimumProvider, string primaryProvider, string secondaryProvider,
        IList<ProviderInfo> providerInfos)
    {
        HasTrader = hasTrader;
        MinimumProvider = minimumProvider;
        PrimaryProvider = ParseProvider(primaryProvider, providerInfos);
        SecondaryProvider = ParseProvider(secondaryProvider, providerInfos);
    }

    [JsonConstructor()]
    public ResultSettings()
    {

    }

    public bool HasTrader { get; set; }

    public int MinimumProvider { get; set; }

    public string SecondaryProvider { get; set; }

    public string PrimaryProvider { get; set; }


    private static string ParseProvider(string providers, IEnumerable<ProviderInfo> providerInfos)
    {
        var providerIds = providers.Split(',');
        var providerNames = providerInfos.Where(p => providerIds.Contains(p.SourceId.ToString()))
            .Select(p => p.SourceName);

        return string.Join(", ", providerNames);
    }
}
