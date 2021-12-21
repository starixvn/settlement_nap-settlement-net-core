using Settlement.Core.Services;
using System;
using System.Collections.Generic;
using Kaden.Extensions;
using Settlement.Core.Models;
using System.Text.Json.Serialization;

namespace Settlement.Sportsbook.Soccer.Models
{
    public class MatchDetail
    {
        private const int ConvertToBase = 2;
        private const int MarkedRefundAllPosition = 5;
        private string goalRecord = string.Empty;

        [JsonIgnore]
        public IRefDataService RefDataService { get; set; }
        
        private bool IsCalRefund { get; set; }

        public int LeagueGroupId { get; set; }

        public int LeagueId { get; set; }

        public string LeagueName => RefDataService.GetLeagueName(LeagueId);

        private int HomeId { get; set; }

        private bool IsNeutral { get; set; }

        public string HomeName => RefDataService.GetTeamName(HomeId) + (IsNeutral ? " (N)" : string.Empty);

        private int AwayId { get; set; }

        public string AwayName => RefDataService.GetTeamName(AwayId);
        private int SportType { get; set; }
        public string SportName => RefDataService.GetSportName(SportType);

        public string MatchCode { get; set; }

        public DateTime KickOffTime { get; set; }

        public string EventStatus { get; set; }

        public bool IsHtOnly { get; set; }

        public int MatchId { get; set; }

        public bool IsExistFgLg { get; set; }

        public bool IsExistHtFgLg { get; set; }

        public bool IsEnabledGoalRecordHt { get; set; }

        public bool IsEnabledGoalRecordFt { get; set; }

        public int? HalfTimeHomeScore { get; set; }

        public int? HalfTimeAwayScore { get; set; }

        public int? FinalHomeScore { get; set; }

        public int? FinalAwayScore { get; set; }

        public string GoalRecord
        {
            get
            {
                var goal = new GoalRecord(IsCalRefund, goalRecord, BetStatus, HalfTimeHomeScore, HalfTimeAwayScore);
                return goal.GetGoalRecord();
            }

            set
            {
                goalRecord = string.IsNullOrWhiteSpace(value) ? string.Empty : value.ToUpperInvariant();
            }
        }

        public string BetStatus { get; set; }

        public GoalIcon GoalIcon { get; set; }

        public int PlayTime { get; set; }

        public int ConfirmHT { get; set; }

        public int ConfirmFT { get; set; }

        public bool IsLive { get; set; }

        public bool IsSettleAbandonedMatchIBC { get; set; }

        public int SettleAbandonedMatchIbcParlay { get; set; }

        public string HtStatus { get; set; }

        public string FtStatus { get; set; }

        public bool IsExistResultAndFirstTeamScore { get; set; }

        public int? SourceId { get; set; }

        public int? ExHTHomeScore { get; set; }

        public int? ExHTAwayScore { get; set; }

        public int? ExFTHomeScore { get; set; }

        public int? ExFTAwayScore { get; set; }

        public string ExternalSourceName { get; set; }

        public bool IsFantasyMatch
        {
            get
            {
                var fantasyLeagueGroup = new List<int> { 16371, 65550, 89611 };

                return fantasyLeagueGroup.Contains(LeagueId);
            }
        }

        private byte SettlementStatus { get; set; }

        public bool IsMarkedRefundAll
        {
            get
            {
                var status = Convert.ToString(SettlementStatus, ConvertToBase).Reverse();
                return !string.IsNullOrWhiteSpace(status) && status.Length > MarkedRefundAllPosition && status[MarkedRefundAllPosition].Equals('1');
            }
        }

        private int AutoSetting { get; set; }

        public bool IsInstant
        {
            get
            {
                var matchSetting = Convert.ToString(AutoSetting, ConvertToBase).Reverse();
                return !string.IsNullOrWhiteSpace(matchSetting) && matchSetting.Length > 1 && matchSetting[1].Equals('1');
            }
        }

        public bool HasInstantCompleted { get; set; }
    }
}