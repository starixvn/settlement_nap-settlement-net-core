using Settlement.Core.Models;

namespace Settlement.EventManagement.Models.MultiSports;

public class Match : BaseMatch
{
    private const int ConvertToBase = 2;

    private const int DirectPayoutBit = 4;

    [Key("isHavingIntervalScore")]
    public bool IsHavingIntervalScore { get; set; }

    [Key("moreScores")]
    public Core.Models.MoreScores MoreScores { get; set; }

    [Key("sportName")]
    public string SportName => RefDataService.GetSportName(SportType);

    #region Match Status

    [Key("isRefund")]
    public bool IsRefund { get; set; }

    [Key("isMultiCaled")]
    public bool IsMultiCaled { get; set; }

    #endregion Match Status

    [IgnoreMember]
    public int AutoSettingForLeague { get; set; }

    [Key("autoPayoutStatus")]
    public int AutoPayoutStatus { get; set; }

    [Key("isAutoPayoutForLeague")]
    public bool IsAutoPayoutForLeague
    {
        get
        {
            var leagueSetting = Convert.ToString(AutoSettingForLeague, ConvertToBase).Reverse();

            if (string.IsNullOrWhiteSpace(leagueSetting))
            {
                return false;
            }

            if (leagueSetting.Length <= DirectPayoutBit)
            {
                return leagueSetting[0].Equals('1');
            }

            return leagueSetting[0].Equals('1') && leagueSetting[DirectPayoutBit].Equals('0');
        }
    }

    [Key("isAutoPayoutForMatch")]
    public bool IsAutoPayoutForMatch
    {
        get
        {
            var matchSetting = Convert.ToString(AutoSetting, ConvertToBase).Reverse();
            if (string.IsNullOrWhiteSpace(matchSetting))
            {
                return false;
            }

            if (matchSetting.Length <= DirectPayoutBit)
            {
                return matchSetting[0].Equals('1');
            }

            return matchSetting[0].Equals('1') && matchSetting[DirectPayoutBit].Equals('0');
        }
    }

    [IgnoreMember]
    public bool IsKeyScore => BetStatus.IsKeyScore(HalfTimeHomeScore, HalfTimeAwayScore, FinalHomeScore, FinalAwayScore);

    [Key("mixParlay")]
    public MixParlay MixParlay => new MixParlay(
        IsCalculated, IsKeyScore,
        IsCalculatingSingle,
        IsCalculatingMP, BetStatus ?? string.Empty, Remark);

    [Key("isExistsConfirmedEarly")]
    public bool IsExistsConfirmedEarly { get; set; }

    [Key("bestOfMap")]
    public int BestOfMap { get; set; }

    [IgnoreMember]
    public ResultDetail ExHTResult { get; set; }

    [IgnoreMember]
    public ResultDetail ExFTResult { get; set; }

    [IgnoreMember]
    public int AutoWaitingTime { get; set; }

    public override bool Equals(object obj)
    {
        return obj is Match match && match.MatchId == MatchId;
    }

    public override int GetHashCode()
    {
        return MatchId;
    }
}