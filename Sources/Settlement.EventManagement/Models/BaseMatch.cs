using System;
using System.Collections.Generic;
using Kaden.Extensions;
using Newtonsoft.Json;
using Settlement.Core.Models;
using Settlement.Core.Services;

namespace Settlement.EventManagement.Models
{
    public class BaseMatch
    {
        private string eventStatus = string.Empty;

        private const string Dash = "-";

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

        public bool IsOpenOdds { get; set; }

        public bool IsExistRunningTicket { get; set; }

        public int? IsCalculatingMP { get; set; }

        public bool IsCalculated { get; set; }

        public bool IsHalfTimeCal { get; set; }

        public bool IsCalRefund { get; set; }

        public int EventStatusReason { get; set; }

        public string EventStatus
        {
            get => eventStatus.MapToString(BetStatus, Remark.IsPending);

            set
            {
                eventStatus = value;
            }
        }

        public string BetStatus { get; set; }

        public RemarkSettingModel Remark => new RemarkSettingModel(SettlementStatus);

        public byte SettlementStatus { get; set; }

        public int SportType { get; set; }

        public string NewEventStatus { get; set; }

        public int AutoSetting { get; set; }

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

        public bool IsExistMarkedTicket { get; set; }

        public bool IsExistEarlyBettypesParlay { get; set; }

        public bool IsRunningEarlyBettypesParlay { get; set; }

        public bool IsWaitingEarlyBettypesParlay { get; set; }

        public bool IsMergedParlay => mergedParlaySports.Contains(SportType);

        public int ChildMatchType { get; set; }

        public List<SiteMatch> SiteMatch { get; set; } = new List<SiteMatch>();
    }
}