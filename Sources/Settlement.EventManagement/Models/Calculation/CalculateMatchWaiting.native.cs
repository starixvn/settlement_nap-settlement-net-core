using Settlement.Core.Models;

namespace Settlement.EventManagement.Models.Calculation;

[MessagePackObject]
public class CalculateMatchWaiting
{
    [Key("matchId")]
    public int MatchId { get; set; }

    [Key("sportType")]
    public int SportType { get; set; }

    [Key("eventStatus")]
    public string EventStatus { get; set; }

    [Key("betStatus")]
    public string BetStatus { get; set; }

    [Key("halfTimeHomeScore")]
    public int? HalfTimeHomeScore { get; set; }

    [Key("halfTimeAwayScore")]
    public int? HalfTimeAwayScore { get; set; }

    [Key("finalHomeScore")]
    public int? FinalHomeScore { get; set; }

    [Key("finalAwayScore")]
    public int? FinalAwayScore { get; set; }

    [Key("isCalculatingSingle")]
    public int? IsCalculatingSingle { get; set; }

    [Key("isCalculatingMP")]
    public int? IsCalculatingMP { get; set; }

    [Key("isCalculated")]
    public bool IsCalculated { get; set; }

    [Key("isRefund")]
    public bool IsRefund { get; set; }

    [Key("isCalRefund")]
    public bool IsCalRefund { get; set; }

    [Key("isHalfTimeCal")]
    public bool IsHalfTimeCal { get; set; }

    [Key("suspenderHalfTime")]
    public string SuspenderHalfTime { get; set; }

    [Key("suspenderFullTime")]
    public string SuspenderFullTime { get; set; }

    [Key("earlySettleStatus")]
    public string EarlySettleStatus { get; set; }

    [Key("isExistRunningTicket")]
    public bool IsExistRunningTicket { get; set; }

    [Key("isExistMarkedTicket")]
    public bool IsExistMarkedTicket { get; set; }

    [Key("autoPayoutStatus")]
    public int AutoPayoutStatus { get; set; }

    [Key("eventStatusColor")]
    public string EventStatusColor { get; set; }

    [Key("fastMarketStatus")]
    public string FastMarketStatus { get; set; }

    [Key("newEventStatus")]
    public string NewEventStatus { get; set; }

    [Key("remark")]
    public RemarkSettingModel Remark { get; set; }

    [Key("exHalfTimeScore")]
    public string ExHalfTimeScore { get; set; }

    [Key("exFullTimeScore")]
    public string ExFullTimeScore { get; set; }

    [Key("isNotConsistentExHtScore")]
    public bool IsNotConsistentExHtScore { get; set; }

    [Key("isNotConsistentExFtScore")]
    public bool IsNotConsistentExFtScore { get; set; }

    [Key("confirmHalfTimeScore")]
    public string ConfirmHalfTimeScore { get; set; }

    [Key("confirmFullTimeScore")]
    public string ConfirmFullTimeScore { get; set; }

    [Key("isFtCalculated")]
    public bool IsFtCalculated { get; set; }

    [Key("goalIcon")]
    public GoalIcon GoalIcon { get; set; }

    [Key("autoCalcSetting")]
    public AutoCalculationSetting AutoCalcSetting { get; set; }

    [Key("instantWaitingTime")]
    public int InstantWaitingTime { get; set; }

    [Key("liveHomeScore")]
    public int? LiveHomeScore { get; set; }

    [Key("liveAwayScore")]
    public int? LiveAwayScore { get; set; }

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

    [Key("instantStatus")]
    public string InstantStatus { get; set; }

    [Key("instantScoreDiff")]
    public int InstantScoreDiff { get; set; }

    [Key("referenceActions")]
    public List<ReferenceAction> ReferenceActions { get; set; }

    [Key("directWaitingTime")]
    public int DirectWaitingTime { get; set; }

    [Key("instantHomeScoreBefore")]
    public string InstantHomeScoreBefore { get; set; }

    [Key("instantAwayScoreBefore")]
    public string InstantAwayScoreBefore { get; set; }

    [Key("instantGoalRecordBefore")]
    public string InstantGoalRecordBefore { get; set; }
}