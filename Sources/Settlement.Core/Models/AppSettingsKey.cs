namespace Settlement.Core.Models;

public class AppSettingsKey
{
    public List<string> SiteDbServer { get; set; }

    public string ThirdPartyJackTimeUrl { get; set; }

    public bool EnableVerifyingRunningOdds { get; set; }

    public string NetPositionApi { get; set; }
}