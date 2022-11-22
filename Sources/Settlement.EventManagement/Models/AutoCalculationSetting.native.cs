namespace Settlement.EventManagement.Models;

[MessagePackObject]
public class AutoCalculationSetting
{
    private const int ConvertToBase = 2;
    private const int DirectPayoutBit = 4;

    private string MatchSetting { get; }

    private string LeagueSetting { get; }

    public AutoCalculationSetting()
    { }

    public AutoCalculationSetting(int autoSettingForMatch, int autoSettingForLeague)
    {
        MatchSetting = Convert.ToString(autoSettingForMatch, ConvertToBase).Reverse();
        LeagueSetting = Convert.ToString(autoSettingForLeague, ConvertToBase).Reverse();
    }

    [Key("isAutoPayoutForMatch")]
    public bool IsAutoPayoutForMatch
    {
        get
        {
            if (string.IsNullOrWhiteSpace(MatchSetting))
            {
                return false;
            }

            if (MatchSetting.Length <= DirectPayoutBit)
            {
                return MatchSetting[0].Equals('1');
            }

            return MatchSetting[0].Equals('1') && MatchSetting[DirectPayoutBit].Equals('0');
        }
    }

    [Key("isDirectPayoutForMatch")]
    public bool IsDirectPayoutForMatch => !string.IsNullOrWhiteSpace(MatchSetting) && MatchSetting.Length > DirectPayoutBit && MatchSetting[DirectPayoutBit].Equals('1');

    [Key("isInstantForMatch")]
    public bool IsInstantForMatch => !string.IsNullOrWhiteSpace(MatchSetting) && MatchSetting.Length > 1 && MatchSetting[1].Equals('1');

    [Key("isAutoPayoutForLeague")]
    public bool IsAutoPayoutForLeague
    {
        get
        {
            if (string.IsNullOrWhiteSpace(LeagueSetting))
            {
                return false;
            }

            if (LeagueSetting.Length <= DirectPayoutBit)
            {
                return LeagueSetting[0].Equals('1');
            }

            return LeagueSetting[0].Equals('1') && LeagueSetting[DirectPayoutBit].Equals('0');
        }
    }

    [Key("isDirectPayoutForLeague")]
    public bool IsDirectPayoutForLeague => !string.IsNullOrWhiteSpace(LeagueSetting) && LeagueSetting.Length > DirectPayoutBit && LeagueSetting[DirectPayoutBit].Equals('1');

    [Key("isInstantForLeague")]
    public bool IsInstantForLeague => !string.IsNullOrWhiteSpace(LeagueSetting) && LeagueSetting.Length > 1 && LeagueSetting[1].Equals('1');
}