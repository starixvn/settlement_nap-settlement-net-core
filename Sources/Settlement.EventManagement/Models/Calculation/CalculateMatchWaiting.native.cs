using Settlement.Core.Models;

namespace Settlement.EventManagement.Models.Calculation;

public class CalculateMatchWaiting
{
    public int MatchId { get; set; }

    public int SportType { get; set; }

    public string EventStatus { get; set; }

    public string BetStatus { get; set; }

    public int? HalfTimeHomeScore { get; set; }

    public int? HalfTimeAwayScore { get; set; }

    public int? FinalHomeScore { get; set; }

    public int? FinalAwayScore { get; set; }

    public int? IsCalculatingSingle { get; set; }

    public int? IsCalculatingMP { get; set; }

    public bool IsCalculated { get; set; }

    public bool IsRefund { get; set; }

    public bool IsCalRefund { get; set; }

    public bool IsHalfTimeCal { get; set; }

    public string SuspenderHalfTime { get; set; }

    public string SuspenderFullTime { get; set; }

    public string EarlySettleStatus { get; set; }

    public bool IsExistRunningTicket { get; set; }

    public bool IsExistMarkedTicket { get; set; }

    public int AutoPayoutStatus { get; set; }

    public string EventStatusColor { get; set; }

    public string FastMarketStatus { get; set; }

    public string NewEventStatus { get; set; }

    public RemarkSettingModel Remark { get; set; }

    public string ExHalfTimeScore { get; set; }

    public string ExFullTimeScore { get; set; }

    public bool IsNotConsistentExHtScore { get; set; }

    public bool IsNotConsistentExFtScore { get; set; }

    public string ConfirmHalfTimeScore { get; set; }

    public string ConfirmFullTimeScore { get; set; }

    public bool IsFtCalculated { get; set; }

    public GoalIcon GoalIcon { get; set; }

    public AutoCalculationSetting AutoCalcSetting { get; set; }

    public int InstantWaitingTime { get; set; }

    public int? LiveHomeScore { get; set; }

    public int? LiveAwayScore { get; set; }

    public string InstantHomeScore { get; set; }

    public string InstantAwayScore { get; set; }

    public int InstantStatusId { get; set; }

    public int InstantKey { get; set; }

    public int InstantCalculationType { get; set; }

    public string InstantStatus { get; set; }

    public int InstantScoreDiff { get; set; }

    public List<ReferenceAction> ReferenceActions { get; set; }

    public int DirectWaitingTime { get; set; }
}