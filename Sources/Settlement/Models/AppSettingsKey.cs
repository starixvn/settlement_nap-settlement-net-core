namespace Settlement.Models;

public class AppSettingsKey
{
    public List<string> SiteDbServer { get; set; }

    public ThirdPartySettingKeys ThirdPartyUri { get; set; }

    public bool EnableVerifyingRunningOdds { get; set; }

}