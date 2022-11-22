using Settlement.Core.Models;

namespace Settlement.EventManagement.Models.Calculation;

public class Match : BaseMatch
{
    private string goalRecord = string.Empty;

    private const int BreakTimeLive = 0;

    private const int HalftimeLive = 1;

    private const int FullTimeLive = 2;

    public bool IsExistFastMarket { get; set; }

    public bool IsExistFastMarketResult { get; set; }

    public bool IsRunningFastMarket { get; set; }

    public bool IsFTCalculated { get; set; }

    public bool IsExistFgLg { get; set; }

    public bool IsExistHtFgLg { get; set; }

    public string FastMarketStatus { get; set; }

    public bool EnableFastMarket
    {
        get
        {
            var fastMarketMatchSetting = Convert.ToString(AutoSetting, 2).Reverse();
            var enableFastMarket = !string.IsNullOrWhiteSpace(fastMarketMatchSetting) && fastMarketMatchSetting.Length > 2 && fastMarketMatchSetting[2].Equals('1');

            return enableFastMarket;
        }
    }

    public string GoalRecord
    {
        get
        {
            var goal = new GoalRecord(IsCalRefund, goalRecord, BetStatus, HalfTimeHomeScore, HalfTimeAwayScore);
            return goal.GetGoalRecord();
        }

        set => goalRecord = string.IsNullOrWhiteSpace(value) ? string.Empty : value.ToUpperInvariant();
    }

    public GoalIcon GoalIcon { get; set; } = new GoalIcon();

    #region InstantCalculate

    public int AutoSettingForLeague { get; set; }

    public AutoCalculationSetting AutoCalcSetting => new AutoCalculationSetting(AutoSetting, AutoSettingForLeague);

    public int DirectWaitingTime { get; set; }

    public int InstantWaitingTime { get; set; }

    public int? LiveHomeScore { get; set; }

    public int? LiveAwayScore { get; set; }

    public bool IsHT { get; set; }

    public int LivePeriod { get; set; }

    public string InstantHomeScore { get; set; }

    public string InstantAwayScore { get; set; }

    public int InstantStatusId { get; set; }

    public int InstantKey { get; set; }

    public int InstantCalculationType { get; set; }

    private bool IsHalftime => !IsHT && LivePeriod == HalftimeLive;

    private bool IsFullTime => !IsHT && LivePeriod == FullTimeLive;

    private bool IsBreakTime => IsHT && LivePeriod == BreakTimeLive;

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

    private string TypeName => InstantCalculationType == Core.Constants.InstantCalculationType.CalcHt ? "HT" : "FT";

    private string ConfirmScore => $"{InstantHomeScore}-{InstantAwayScore} ({TypeName})";

    private bool RemarkSetting => !Remark.IsUndecided && !Remark.IsPending && !Remark.IsMtdHold && !Remark.IsKeyHold;

    private bool IsInstantLive => EventStatus.Equals(Core.Constants.EventStatus.Running)
        && InstantStatusId == Core.Constants.InstantStatus.Live && RemarkSetting;

    private bool CheckEventStatus => NewEventStatus.Equals(Core.Constants.EventStatus.Waiting)
                                     || NewEventStatus.Equals(Core.Constants.EventStatus.Calculating)
                                     || EventStatus.Equals(Core.Constants.EventStatus.Running)
                                     || EventStatus.IgnoreCaseEquals(Core.Constants.EventStatus.RefundHT);

    private bool ConfirmCompleted => InstantStatusId == Core.Constants.InstantStatus.Complete
        || (InstantStatusId == Core.Constants.InstantStatus.Confirm && CheckEventStatus);

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

    public int InstantScoreDiff { get; set; }

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