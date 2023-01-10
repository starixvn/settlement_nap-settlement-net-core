using Settlement.Core.Models;

namespace Settlement.EventManagement.Models.MultiSports;

public class Match : BaseMatch
{
    private const int ConvertToBase = 2;

    private const int DirectPayoutBit = 4;

    private readonly List<int> sportSupportDirect = new List<int>
    {
        Core.Constants.SportType.VolleyBall,
        Core.Constants.SportType.Badminton,
        Core.Constants.SportType.Cricket
    };

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

    [Key("autoPayoutStatus")]
    public int AutoPayoutStatus { get; set; }

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

    [Key("applyDirect")]
    public bool ApplyDirect => sportSupportDirect.Contains(SportType);

    [IgnoreMember]
    public ResultDetail ExHTResult { get; set; }

    [IgnoreMember]
    public ResultDetail ExFTResult { get; set; }

    [IgnoreMember]
    public int AutoWaitingTime { get; set; }

    [Key("autoCalcSetting")]
    public AutoCalculationSetting AutoCalcSetting => new AutoCalculationSetting(AutoSetting, AutoSettingForLeague);

    public override bool Equals(object obj)
    {
        return obj is Match match && match.MatchId == MatchId;
    }

    public override int GetHashCode()
    {
        return MatchId;
    }
}