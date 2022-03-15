using System;
using System.Collections.Generic;
using Kaden.Extensions;
using Newtonsoft.Json;
using Settlement.Core.Constants;
using Settlement.Core.Services;

namespace Settlement.EventManagement.Models
{
    public class Match
    {
        private const int IsWaiting = 0;
        private const int IsSuccess = 2;
        private const string Dash = "-";
        private string eventStatus = string.Empty;
        private string suspenderHalfTime = string.Empty;
        private string suspenderFullTime = string.Empty;

        private readonly List<int> mergedParlaySports = new List<int>
        {
            Core.Constants.SportType.Badminton,
            Core.Constants.SportType.BasketBall,
            Core.Constants.SportType.Cricket,
            Core.Constants.SportType.ESports,
            Core.Constants.SportType.Tennis,
            Core.Constants.SportType.BeachVolleyball,
            Core.Constants.SportType.VolleyBall
        };

        [JsonIgnore]
        public IRefDataService RefDataService { get; set; }

        public int HomeId { get; set; }

        public string HomeName => RefDataService.GetTeamName(HomeId) + (IsNeutral ? " (N)" : string.Empty);

        public bool IsNeutral { get; set; }

        public int AwayId { get; set; }

        public string AwayName => RefDataService.GetTeamName(AwayId);

        public string MatchCode { get; set; }

        public DateTime KickOffTime { get; set; }

        public bool IsHavingIntervalScore { get; set; }

        public Core.Models.MoreScores MoreScores { get; set; }

        public int SportType { get; set; }

        public int MatchId { get; set; }

        public int LeagueId { get; set; }

        public int GroupSport { get; set; }

        public string SportName => RefDataService.GetSportName(SportType);

        public string LeagueName => RefDataService.GetLeagueName(LeagueId);

        #region Match Status

        public bool IsCalculated { get; set; }

        public bool IsRefund { get; set; }

        public bool IsCalRefund { get; set; }

        public bool IsHalfTimeCal { get; set; }

        public byte SettlementStatus { get; set; }

        public bool IsMultiCaled { get; set; }

        #endregion Match Status

        public int? HalfTimeHomeScore { get; set; }

        public int? HalfTimeAwayScore { get; set; }

        public int? FinalHomeScore { get; set; }

        public int? FinalAwayScore { get; set; }

        public int? IsCalculatingSingle { get; set; }

        public int? IsCalculatingMP { get; set; }

        public string EventStatus
        {
            get => eventStatus.MapToString(BetStatus, Remark.IsPending);

            set
            {
                eventStatus = value;
            }
        }

        public string BetStatus { get; set; }

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
                    return Core.Constants.EventStatus.Waiting;
                }
                else if (IsCalculatingSingle == IsSuccess)
                {
                    return EventStatus;
                }
                else
                {
                    return Core.Constants.EventStatus.Calculating;
                }
            }
        }

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

        public Core.Models.ResultDetail ExHTResult { get; set; }

        public Core.Models.ResultDetail ExFTResult { get; set; }

        public string ExHalfTimeScore => ExHTResult != null ? $"({ExHTResult.SourceName}: {ExHTResult.HomeValue}-{ExHTResult.AwayValue})" : string.Empty;

        public string ExFullTimeScore => ExFTResult != null ? $"({ExFTResult.SourceName}: {ExFTResult.HomeValue}-{ExFTResult.AwayValue})" : string.Empty;

        public List<Core.Models.ReferenceAction> ReferenceActions { get; set; }

        public int AutoSetting { get; set; }

        public int AutoSettingForLeague { get; set; }

        public int AutoPayoutStatus { get; set; }

        public AutoCalculationSetting AutoCalcSetting => new AutoCalculationSetting(AutoSetting, AutoSettingForLeague);

        public Core.Models.RemarkSettingModel Remark => new Core.Models.RemarkSettingModel(SettlementStatus);

        public bool IsKeyScore => BetStatus.IsKeyScore(HalfTimeHomeScore, HalfTimeAwayScore, FinalHomeScore, FinalAwayScore);

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

        public bool IsExistRunningTicket { get; set; }

        public bool IsExistMarkedTicket { get; set; }

        public bool IsExistMarkedTicketParlay { get; set; }

        public string EventStatusColor
        {
            get
            {
                if (EventStatus.IgnoreCaseEquals(Core.Constants.EventStatus.PostPoned))
                {
                    return IsExistMergedAndMarkedTickets ? Background.YellowBlinking : Background.Yellow;
                }

                if (EventStatus.IgnoreCaseEquals(Core.Constants.EventStatus.Completed))
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

        private bool IsOnlyMarkedTicket => IsExistMergedAndMarkedTickets && !IsExistRunningTicket;

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

        public bool IsExistsConfirmedEarly { get; set; }

        public bool IsExistRunningTicketParlay { get; set; }
    }
}