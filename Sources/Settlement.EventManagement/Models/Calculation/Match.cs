using Kaden.Extensions;
using Settlement.Core.Models;
using Settlement.Core.Services;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Settlement.EventManagement.Models.Calculation
{
    public class Match
    {
        private string eventStatus = string.Empty;

        private const string Dash = "-";

        private string suspenderHalfTime = string.Empty;

        private string suspenderFullTime = string.Empty;

        private string goalRecord = string.Empty;

        private const int BreakTimeLive = 0;

        private const int HalftimeLive = 1;

        private const int FullTimeLive = 2;

        [JsonIgnore]
        public IRefDataService RefDataService { get; set; }

        public int MatchId { get; set; }

        public int LeagueId { get; set; }

        public string LeagueName => RefDataService.GetLeagueName(LeagueId);

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
        public bool IsNeutral { get; set; }

        public int? HalfTimeHomeScore { get; set; }

        public int? HalfTimeAwayScore { get; set; }

        public int? FinalHomeScore { get; set; }

        public int? FinalAwayScore { get; set; }

        public bool IsExistRunningTicketParlay { get; set; }

        public bool IsExistMarkedTicketParlay { get; set; }

        public bool IsExistEarlyBetTypes { get; set; }

        public bool IsRunningEarlyBetTypes { get; set; }

        public bool IsWaitingEarlyBetTypes { get; set; }

        public int? IsCalculatingSingle { get; set; }

        public int ChildMatchType { get; set; }

        public bool IsOpenOdds { get; set; }

        public bool IsExistFastMarket { get; set; }

        public bool IsExistFastMarketResult { get; set; }

        public bool IsRunningFastMarket { get; set; }

        public bool IsExistRunningTicket { get; set; }

        public bool IsExistMarkedTicket { get; set; }

        public int? IsCalculatingMP { get; set; }

        public bool IsCalculated { get; set; }

        public bool IsFTCalculated { get; set; }

        public bool IsHalfTimeCal { get; set; }

        public bool IsCalRefund { get; set; }

        public bool IsExistFgLg { get; set; }

        public bool IsExistHtFgLg { get; set; }

        public byte SettlementStatus { get; set; }

        public RemarkSettingModel Remark => new RemarkSettingModel(SettlementStatus);

        public string BetStatus { get; set; }

        public int EventStatusReason { get; set; }

        public string EventStatus
        {
            get => eventStatus.MapToString(BetStatus, Remark.IsPending);

            set
            {
                eventStatus = value;
            }
        }

        public int SportType { get; set; }

        public string NewEventStatus { get; set; }

        public string FastMarketStatus { get; set; }

        public int AutoSetting { get; set; }

        public bool EnableFastMarket
        {
            get
            {
                var fastMarketMatchSetting = Convert.ToString(AutoSetting, 2).Reverse();
                var enableFastMarket = !string.IsNullOrWhiteSpace(fastMarketMatchSetting) && fastMarketMatchSetting.Length > 2 && fastMarketMatchSetting[2].Equals('1');

                return enableFastMarket;
            }
        }

        public string EarlySettleStatus { get; set; }

        public string EventStatusColor { get; set; }

        public bool IsNotConsistentExHtScore { get; set; }

        public bool IsNotConsistentExFtScore { get; set; }

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

        public string ConfirmHalfTimeScore { get; set; }

        public string ConfirmFullTimeScore { get; set; }

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

        public List<SiteMatch> SiteMatch { get; set; } = new List<SiteMatch>();

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

        private string ConfirmScore => $"{ InstantHomeScore }-{ InstantAwayScore} ({ TypeName})";

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
}