namespace Settlement.EventManagement.Models;

[MessagePackObject]
public class AutoCalculationSetting
{
    private const int ConvertToBase = 2;
    private const int DirectPayoutBit = 4;

    [Key("matchSetting")]
    public string MatchSetting { get; set; }

    [Key("leagueSetting")]
    public string LeagueSetting { get; set; }

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

            return MatchSetting[0].Equals('1');
        }
    }

    [Key("isDirectPayoutForMatch")]
    public bool IsDirectPayoutForMatch => !string.IsNullOrWhiteSpace(MatchSetting) && MatchSetting.Length > DirectPayoutBit && MatchSetting[DirectPayoutBit].Equals('1');

    [Key("isAutoPayoutForLeague")]
    public bool IsAutoPayoutForLeague
    {
        get
        {
            if (string.IsNullOrWhiteSpace(LeagueSetting))
            {
                return false;
            }
            return LeagueSetting[0].Equals('1');
        }
    }

    [Key("isDirectPayoutForLeague")]
    public bool IsDirectPayoutForLeague => !string.IsNullOrWhiteSpace(LeagueSetting) && LeagueSetting.Length > DirectPayoutBit && LeagueSetting[DirectPayoutBit].Equals('1');
}