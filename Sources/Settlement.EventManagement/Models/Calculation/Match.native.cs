namespace Settlement.EventManagement.Models.Calculation;

[MessagePackObject]
public class Match : BaseMatch
{
    private string goalRecord = string.Empty;
    private const int BreakTimeLive = 0;
    private const int HalftimeLive = 1;
    private const int FullTimeLive = 2;

    [Key("isExistFastMarket")]
    public bool IsExistFastMarket { get; set; }

    [Key("isExistFastMarketResult")]
    public bool IsExistFastMarketResult { get; set; }

    [Key("isRunningFastMarket")]
    public bool IsRunningFastMarket { get; set; }

    [Key("isFtCalculated")]
    public bool IsFtCalculated { get; set; }

    [Key("isExistFgLg")]
    public bool IsExistFgLg { get; set; }

    [Key("isExistHtFgLg")]
    public bool IsExistHtFgLg { get; set; }

    [Key("fastMarketStatus")]
    public string FastMarketStatus { get; set; }

    [Key("enableFastMarket")]
    public bool EnableFastMarket
    {
        get
        {
            var fastMarketMatchSetting = Convert.ToString(AutoSetting, 2).Reverse();
            var enableFastMarket = !string.IsNullOrWhiteSpace(fastMarketMatchSetting) && fastMarketMatchSetting.Length > 2 && fastMarketMatchSetting[2].Equals('1');

            return enableFastMarket;
        }
    }

    [Key("goalRecord")]
    public string GoalRecord
    {
        get
        {
            var goal = new GoalRecord(IsCalRefund, goalRecord, BetStatus, HalfTimeHomeScore, HalfTimeAwayScore);
            return goal.GetGoalRecord();
        }
        set => goalRecord = string.IsNullOrWhiteSpace(value) ? string.Empty : value.ToUpperInvariant();
    }

    [Key("goalIcon")]
    public GoalIcon GoalIcon { get; set; } = new();

    #region InstantCalculate

    [Key("autoCalcSetting")]
    public AutoCalculationSetting AutoCalcSetting => new(AutoSetting, AutoSettingForLeague);

    [Key("instantWaitingTime")]
    public int InstantWaitingTime { get; set; }

    [Key("refundWaitingTime")]
    public int RefundWaitingTime { get; set; }

    [Key("liveHomeScore")]
    public int? LiveHomeScore { get; set; }

    [Key("liveAwayScore")]
    public int? LiveAwayScore { get; set; }

    [Key("isHt")]
    public bool IsHt { get; set; }

    [Key("livePeriod")]
    public int LivePeriod { get; set; }

    [Key("instantHomeScore")]
    public string InstantHomeScore { get; set; }

    [Key("instantAwayScore")]
    public string InstantAwayScore { get; set; }

    [Key("instantStatusId")]
    public int InstantStatusId { get; set; }

    [Key("instantKey")]
    public int InstantKey { get; set; }

    [Key("instantCalculationType")]
    public int InstantCalculationType { get; set; }

    [IgnoreMember]
    private bool IsHalftime => !IsHt && LivePeriod == HalftimeLive;

    [IgnoreMember]
    private bool IsFullTime => !IsHt && LivePeriod == FullTimeLive;

    [IgnoreMember]
    private bool IsBreakTime => IsHt && LivePeriod == BreakTimeLive;

    [IgnoreMember]
    private string Live
    {
        get
        {
            if (IsHalftime)
            {
                return "LIVE! - 1H";
            }
            else if (IsFullTime)
            {
                return "LIVE! - 2H";
            }
            else if (IsBreakTime)
            {
                return "LIVE!";
            }
            else
            {
                return string.Empty;
            }
        }
    }

    [IgnoreMember]
    private string TypeName => InstantCalculationType == Core.Constants.InstantCalculationType.CalcHt ? "HT" : "FT";

    [IgnoreMember]
    private string ConfirmScore => $"{InstantHomeScore}-{InstantAwayScore} ({TypeName})";

    [IgnoreMember]
    private bool RemarkSetting => !Remark.IsUndecided && !Remark.IsPending && !Remark.IsMtdHold && !Remark.IsKeyHold;

    [IgnoreMember]
    private bool IsInstantLive => EventStatus.Equals(Core.Constants.EventStatus.Running)
        && InstantStatusId == Core.Constants.InstantStatus.Live && RemarkSetting;

    [IgnoreMember]
    private bool CheckEventStatus => NewEventStatus.Equals(Core.Constants.EventStatus.Waiting)
                                     || NewEventStatus.Equals(Core.Constants.EventStatus.Calculating)
                                     || EventStatus.Equals(Core.Constants.EventStatus.Running)
                                     || EventStatus.IgnoreCaseEquals(Core.Constants.EventStatus.RefundHt);

    [IgnoreMember]
    private bool ConfirmCompleted => InstantStatusId == Core.Constants.InstantStatus.Complete
        || (InstantStatusId == Core.Constants.InstantStatus.Confirm && CheckEventStatus);

    [Key("instantStatus")]
    public string InstantStatus
    {
        get
        {
            if (IsInstantLive)
            {
                return Live;
            }
            else if (ConfirmCompleted)
            {
                return ConfirmScore;
            }
            else
            {
                return string.Empty;
            }
        }
    }

    [Key("instantScoreDiff")]
    public int InstantScoreDiff { get; set; }

    [Key("referenceActions")]
    public List<ReferenceAction> ReferenceActions { get; set; }

    #endregion InstantCalculate

    public override bool Equals(object obj)
    {
        return obj is Match match && match.MatchId == MatchId;
    }

    public override int GetHashCode()
    {
        return MatchId;
    }
}