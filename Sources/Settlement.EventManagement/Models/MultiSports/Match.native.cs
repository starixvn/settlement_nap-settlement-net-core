namespace Settlement.EventManagement.Models.MultiSports;

public class Match : BaseMatch
{
    private readonly List<int> sportSupportDirect =
    [
        SportType.VolleyBall,
        SportType.Badminton,
        SportType.Cricket,
        SportType.Tennis
    ];

    [Key("isHavingIntervalScore")]
    public bool IsHavingIntervalScore { get; set; }

    [Key("moreScores")]
    public MoreScores MoreScores { get; set; }

    [Key("sportName")]
    public string SportName => RefDataService == null ? string.Empty : RefDataService.GetSportName(SportType);

    #region Match Status

    [Key("isRefund")]
    public bool IsRefund { get; set; }

    [Key("isMultiCaled")]
    public bool IsMultiCaled { get; set; }

    #endregion Match Status

    [IgnoreMember]
    public bool IsKeyScore => BetStatus.IsKeyScore(HalfTimeHomeScore, HalfTimeAwayScore, FinalHomeScore, FinalAwayScore);

    [Key("isExistsConfirmedEarly")]
    public bool IsExistsConfirmedEarly { get; set; }

    [Key("bestOfMap")]
    public int BestOfMap { get; set; }

    [Key("applyDirect")]
    public bool ApplyDirect => sportSupportDirect.Contains(SportType);

    [IgnoreMember]
    public ResultDetail ExHtResult { get; set; }

    [IgnoreMember]
    public ResultDetail ExFtResult { get; set; }

    [IgnoreMember]
    public int AutoWaitingTime { get; set; }

    [IgnoreMember]
    public int RefundWaitingTime { get; set; }

    [IgnoreMember]
    public int AutoRetryTime { get; set; }

    [Key("autoCalcSetting")]
    public AutoCalculationSetting AutoCalcSetting => new(AutoSetting, AutoSettingForLeague, true);

    [IgnoreMember]
    public int ConfirmHT { get; set; }

    [IgnoreMember]
    public int ConfirmFT { get; set; }

    public override bool Equals(object obj)
    {
        return obj is Match match && match.MatchId == MatchId;
    }

    public override int GetHashCode()
    {
        return MatchId;
    }
}