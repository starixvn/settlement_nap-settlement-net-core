namespace Settlement.ThirdPartyProducts.Models;

public class AutoSetting
{
    private const int Position = 3;

    public string MatchSetting { get; set; }

    public bool IsAutoSettingForMatch => IsAutoSetting(MatchSetting);

    public string LeagueSetting { get; set; }

    public bool IsAutoSettingForLeague => IsAutoSetting(LeagueSetting);

    private static bool IsAutoSetting(string setting)
    {
        return !string.IsNullOrWhiteSpace(setting) && setting.Length > Position && setting[Position].Equals('1');
    }
}