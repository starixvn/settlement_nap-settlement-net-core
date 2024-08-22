using Settlement.Core.Models;
using Settlement.Core.Services;

namespace Settlement.Setting.Models.LeagueSettings;

public class LeagueSettings
{
    public IRefDataService RefDataService { get; set; }

    public int LeagueId { get; set; }

    public int Main_WaitingTime { get; set; }

    public int EAR_WaitingTime { get; set; }

    public string Main_InactiveProvider { get; set; }

    public string EAR_InactiveProvider { get; set; }

    public bool Main_HasTrader { get; set; }

    public int Main_NumberProvider { get; set; }

    public string Main_PrimaryProvider { get; set; }

    public string Main_SecondaryProvider { get; set; }

    public bool EAR_HasTrader { get; set; }

    public int EAR_NumberProvider { get; set; }

    public string EAR_PrimaryProvider { get; set; }

    public string EAR_SecondaryProvider { get; set; }

    public string LeagueName => RefDataService.GetLeagueName(LeagueId);

    public List<ProviderInfo> Providers { get; set; }
}