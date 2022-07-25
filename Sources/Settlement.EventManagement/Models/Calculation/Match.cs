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

        [JsonIgnore]
        public RefDataService RefDataService { get; set; }

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

        public RemarkSettingModel Remark { get; set; }

        public string BetStatus { get; set; }

        public string EventStatus
        {
            get => eventStatus.MapToString(BetStatus, Remark.IsPending);

            set
            {
                eventStatus = value;
            }
        }

        public int SportType { get; set; }

        public List<SiteMatch> SiteInfo { get; set; } = new List<SiteMatch>();

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
