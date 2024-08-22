using Settlement.Core.Models;

namespace Settlement.Setting.Models.LeagueSettings;

public class AutoSettings
{
    public int LeagueId { get; set; }

    public string LeagueName { get; set; }

    public List<ProviderInfo> Providers { get; set; }

    public ResultSettings MainResultSettings { get; set; }

    public ResultSettings EarlyResultSettings { get; set; }
}