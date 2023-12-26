namespace Settlement.Setting.Models.LeagueSettings;
public class ResultSettings(bool hasTrader, int minimumProvider, string primaryProvider, string secondaryProvider, IList<ProviderInfo> providerInfos)
{
    public bool HasTrader { get; set; } = hasTrader;

    public int MinimumProvider { get; set; } = minimumProvider;

    public string PrimaryProvider { get; set; } = ParseProvider(primaryProvider, providerInfos);

    public string SecondaryProvider { get; } = ParseProvider(secondaryProvider, providerInfos);


    private static string ParseProvider(string providers, IEnumerable<ProviderInfo> providerInfos)
    {
        var providerIds = providers.Split(',');
        var providerNames = providerInfos.Where(p => providerIds.Contains(p.SourceId.ToString()))
            .Select(p => p.SourceName);

        return string.Join(", ", providerNames);
    }
}
