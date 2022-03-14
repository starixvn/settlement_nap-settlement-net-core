using Kaden.Extensions;
using Settlement.Core.Constants;
using Settlement.Core.Services;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Settlement.Core.Models
{
    public class Match
    {
        private const int BreakTimeLive = 0;
        private const int HalftimeLive = 1;
        private const int FullTimeLive = 2;
        private const int IsWaiting = 0;
        private const int IsSuccess = 2;
        private const string Dash = "-";
        private string goalRecord = string.Empty;
        private string eventStatus = string.Empty;
        private string suspenderHalfTime = string.Empty;
        private string suspenderFullTime = string.Empty;
        private string instantHomeScore = string.Empty;
        private string instantAwayScore = string.Empty;
        private BackgroundColor backgroundColor;

        private readonly List<int> mergedParlaySports = new List<int>
        {
            Constants.SportType.Badminton,
            Constants.SportType.BasketBall,
            Constants.SportType.Cricket,
            Constants.SportType.ESports,
            Constants.SportType.Tennis,
            Constants.SportType.BeachVolleyball,
            Constants.SportType.VolleyBall
        };

        [JsonIgnore]
        public IRefDataService RefDataService { get; set; }

        [JsonIgnore]
        public int LeagueIndex { get; set; }

        public string LeagueName => RefDataService.GetLeagueName(LeagueId);

        [JsonIgnore]
        public int InstantWaitingTime { get; set; }

        [JsonIgnore]
        public int DirectWaitingTime { get; set; }

        [JsonIgnore]
        public int HomeId { get; set; }

        public string HomeName => RefDataService.GetTeamName(HomeId) + (IsNeutral ? " (N)" : string.Empty);

        [JsonIgnore]
        public int AwayId { get; set; }

        public string AwayName => RefDataService.GetTeamName(AwayId);

        public string MatchCode { get; set; }

        public DateTime KickOffTime { get; set; }

        [JsonIgnore]
        public DateTime EventDate { get; set; }

        [JsonIgnore]
        public int BetCount { get; set; }

        [JsonIgnore]
        public bool IsHtOnly { get; set; }

        [JsonIgnore]
        public string EventParlayStatusColor => IsCalculatingMP == 0
                                            ? Constants.EventStatus.Waiting.ToLowerInvariant()
                                            : Constants.EventStatus.Calculating.ToLowerInvariant();

        [JsonIgnore]
        public string UndecidedColor
        {
            get
            {
                if (Remark.IsUndecided || Remark.IsUnderSettle || Remark.IsMtdHold || Remark.IsKeyHold)
                {
                    return Background.Undecided;
                }

                return string.Empty;
            }
        }

        [JsonIgnore]
        public bool IsNeutral { get; set; }

        public string SportName => RefDataService.GetSportName(SportType);

        public bool IsHavingIntervalScore { get; set; }

        public MoreScores MoreScores { get; set; }

        public List<ReferenceAction> ReferenceActions { get; set; }

        public int SportType { get; set; }

        public int MatchId { get; set; }

        public int LeagueId { get; set; }

        #region Match Status

        public bool IsKeyScore => BetStatus.IsKeyScore(HalfTimeHomeScore, HalfTimeAwayScore, FinalHomeScore, FinalAwayScore);

        public bool IsCalculated { get; set; }

        public bool IsFTCalculated { get; set; }

        public bool IsRefund { get; set; }

        public bool IsCalRefund { get; set; }

        public bool IsHalfTimeCal { get; set; }

        public byte SettlementStatus { get; set; }

        public bool IsMultiCaled { get; set; }

        public bool IsExistFgLg { get; set; }

        public bool IsExistHtFgLg { get; set; }

        public bool IsEnabledGoalRecordHt { get; set; }

        public bool IsEnabledGoalRecordFt { get; set; }

        #endregion Match Status

        public int? HalfTimeHomeScore { get; set; }

        public int? HalfTimeAwayScore { get; set; }

        public int? FinalHomeScore { get; set; }

        public int? FinalAwayScore { get; set; }

        public int? IsCalculatingSingle { get; set; }

        public int? IsCalculatingMP { get; set; }

        public ResultDetail ExHTResult { get; set; }

        public ResultDetail ExFTResult { get; set; }

        public string GoalRecord
        {
            get
            {
                var goal = new GoalRecord(IsCalRefund, goalRecord, BetStatus, HalfTimeHomeScore, HalfTimeAwayScore);
                return goal.GetGoalRecord();
            }

            set => goalRecord = string.IsNullOrWhiteSpace(value) ? string.Empty : value.ToUpperInvariant();
        }

        public string EventStatus
        {
            get => eventStatus.MapToString(BetStatus, Remark.IsPending);

            set => eventStatus = value;
        }

        public int GroupSport { get; set; }

        public string BetStatus { get; set; }

        public GoalIcon GoalIcon { get; set; } = new GoalIcon();

        public string NewEventStatus
        {
            get
            {
                if (IsCalculatingSingle == null)
                {
                    return EventStatus;
                }

                if (IsCalculatingSingle == IsWaiting)
                {
                    return Constants.EventStatus.Waiting;
                }
                else if (IsCalculatingSingle == IsSuccess)
                {
                    return EventStatus;
                }
                else
                {
                    return Constants.EventStatus.Calculating;
                }
            }
        }

        public string AutoSettleFastMarket { get; set; }

        public string EarlySettleStatus { get; set; }

        public string SuspenderHalfTime
        {
            get => string.IsNullOrEmpty(suspenderHalfTime) ? Dash : suspenderHalfTime;

            set => suspenderHalfTime = value;
        }

        public string SuspenderFullTime
        {
            get => string.IsNullOrEmpty(suspenderFullTime) ? Dash : suspenderFullTime;

            set => suspenderFullTime = value;
        }

        public string ExHalfTimeScore => ExHTResult != null ? $"({ExHTResult.SourceName}: {ExHTResult.HomeValue}-{ExHTResult.AwayValue})" : string.Empty;

        public string ExFullTimeScore => ExFTResult != null ? $"({ExFTResult.SourceName}: {ExFTResult.HomeValue}-{ExFTResult.AwayValue})" : string.Empty;

        public int AutoSetting { get; set; }

        public int AutoSettingForLeague { get; set; }

        public int AutoPayoutStatus { get; set; }

        public AutoCalculationSetting AutoCalcSetting => new AutoCalculationSetting(AutoSetting, AutoSettingForLeague);

        public RemarkSettingModel Remark => new RemarkSettingModel(SettlementStatus);

        public bool IsNeedToCalculateFGLG { get; set; }

        #region Instant Calculation

        public int? LiveHomeScore { get; set; }

        public int? LiveAwayScore { get; set; }

        public bool IsHT { get; set; }

        public int LivePeriod { get; set; }

        public string InstantHomeScore
        {
            get => string.IsNullOrWhiteSpace(instantHomeScore) ? Dash : instantHomeScore;

            set => instantHomeScore = value;
        }

        public string InstantAwayScore
        {
            get => string.IsNullOrWhiteSpace(instantAwayScore) ? Dash : instantAwayScore;

            set => instantAwayScore = value;
        }

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

        private string TypeName => InstantCalculationType == Constants.InstantCalculationType.CalcHt ? "HT" : "FT";

        private string ConfirmScore => $"{ InstantHomeScore }-{ InstantAwayScore} ({ TypeName})";

        private bool IsInstantLive => EventStatus.Equals(Constants.EventStatus.Running)
            && InstantStatusId == Constants.InstantStatus.Live && RemarkSetting;

        public bool NeedConfirmScore => InstantStatusId == Constants.InstantStatus.Confirm;

        public bool IsManualCalculated => InstantCalculationType == Constants.InstantCalculationType.CalcFt && IsFTCalculated;

        private bool CheckEventStatus => NewEventStatus.Equals(Constants.EventStatus.Waiting)
            || NewEventStatus.Equals(Constants.EventStatus.Calculating)
            || NewEventStatus.Equals(Constants.EventStatus.Running)
            || NewEventStatus.IgnoreCaseEquals(Constants.EventStatus.RefundHT);

        private bool ConfirmCompleted => InstantStatusId == Constants.InstantStatus.Complete
            || (InstantStatusId == Constants.InstantStatus.Confirm && CheckEventStatus);

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

        #endregion Instant Calculation

        public BackgroundColor BackgroundColor => backgroundColor ?? (backgroundColor = new BackgroundColor
        {
            IsCalRefund = IsCalRefund,
            SportType = SportType,
            IsHalfTimeCal = IsHalfTimeCal,
            IsCalculated = IsCalculated,
            IsMultiCaled = IsMultiCaled,
            IsRefund = IsRefund,
            EarlySettleStatus = EarlySettleStatus,
            AutoSettleFastMarket = AutoSettleFastMarket,
            EventStatus = EventStatus,
            AutoSetting = AutoSetting,
            IsExistMarkedTicketParlay = IsExistMarkedTicketParlay,
            IsExistRunningTicketParlay = IsExistRunningTicketParlay
        });

        public MixParlay MixParlay => new MixParlay(
            IsCalculated, IsKeyScore,
            IsCalculatingSingle,
            IsCalculatingMP, BetStatus ?? string.Empty, Remark);

        public bool ShowLink
        {
            get
            {
                if (IsMergedParlay)
                {
                    var isSingleNotCalculating = IsCalculatingSingle == null || IsCalculatingSingle == IsSuccess;
                    return RemarkSetting && !Remark.IsUnderSettle && isSingleNotCalculating;
                }

                return RemarkSetting && !Remark.IsUnderSettle && IsCalculatingSingle == null && IsCalculatingMP == null;
            }
        }

        private bool RemarkSetting => !Remark.IsUndecided && !Remark.IsPending && !Remark.IsMtdHold && !Remark.IsKeyHold;

        public bool ShowFastMarketsLink => IsCalculatingSingle == null && IsCalculatingMP == null;

        public string OddOrEven { get; set; }

        public bool IsExistRunningTicket { get; set; }

        public bool IsExistMarkedTicket { get; set; }

        public bool IsExistMarkedTicketParlay { get; set; }

        public string EventStatusColor
        {
            get
            {
                if (EventStatus.IgnoreCaseEquals(Constants.EventStatus.PostPoned))
                {
                    return IsExistMergedAndMarkedTickets ? Background.YellowBlinking : Background.Yellow;
                }

                if (EventStatus.IgnoreCaseEquals(Constants.EventStatus.Completed))
                {
                    return GetBackgroundCompletedStatus;
                }

                if (Remark.IsPending && EventStatus.IgnoreCaseEquals(EventStatusExtensions.ResultPending))
                {
                    return IsExistMergedAndMarkedTickets ? Background.BrightYellowBlinking : Background.BrightYellow;
                }

                return IsExistMergedAndMarkedTickets ? Background.WhiteBlinking : string.Empty;
            }
        }

        public string ConfirmHalfTimeColor => IsNotConsistentExHtScore ? Background.WhiteBlinking : string.Empty;

        public string ConfirmFullTimeColor => IsNotConsistentExFtScore ? Background.WhiteBlinking : string.Empty;

        #region ExternalScore

        public bool IsNotConsistentExHtScore { get; set; }

        public bool IsNotConsistentExFtScore { get; set; }

        #endregion ExternalScore

        private string GetBackgroundCompletedStatus =>
            IsOnlyMarkedTicket
                ? Background.WhiteBlinking
                : GetBackgroundRunningTicket;

        private string GetBackgroundRunningTicket
        {
            get
            {
                if (IsExistRunningTicket)
                {
                    return IsExistMergedAndMarkedTickets ? Background.PinkBlinking : Background.Pink;
                }

                return string.Empty;
            }
        }

        public bool IsMergedParlay => mergedParlaySports.Contains(SportType);

        private bool IsExistMergedAndMarkedTickets
        {
            get
            {
                if (IsMergedParlay)
                {
                    return IsExistMarkedTicket || IsExistMarkedTicketParlay;
                }

                return IsExistMarkedTicket;
            }
        }

        private bool IsOnlyMarkedTicket => IsExistMergedAndMarkedTickets && !IsExistRunningTicket;

        public bool IsExistsConfirmedEarly { get; set; }

        public int? EventStatusReason { get; set; }

        public bool IsExistRunningTicketParlay { get; set; }
    }
}