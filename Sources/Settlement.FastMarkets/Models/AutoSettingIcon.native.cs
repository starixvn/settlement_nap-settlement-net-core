using Settlement.Core.Constants;

namespace Settlement.FastMarkets.Models;

public class AutoSettingIcon
{
    public string MatchSetting { get; set; }

    public string LeagueSetting { get; set; }

    public string Match => GetIcon(MatchSetting, Disabled);

    public string League => GetIcon(LeagueSetting, Disabled);

    public bool Disabled { get; set; }

    private static string GetIcon(string setting, bool disabled)
    {
        var isOnIcon = !string.IsNullOrWhiteSpace(setting) && setting.Length > 2 && setting[2].Equals('1');
        if (disabled)
        {
            return isOnIcon ? Background.IconYesDisable : Background.IconNoDisable;
        }

        return isOnIcon ? Background.IconYes : Background.IconNo;
    }
}