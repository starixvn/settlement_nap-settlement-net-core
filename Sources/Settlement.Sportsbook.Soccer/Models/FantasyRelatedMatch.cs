using Kaden.Extensions;
using System;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using System.Text.Json.Serialization;

namespace Settlement.Sportsbook.Soccer.Models
{
    public class FantasyRelatedMatch
    {
        private string eventStatus = string.Empty;

        private const int ConvertToBase = 2;

        [JsonIgnore]
        public IRefDataService RefDataService { get; set; }

        public int MatchId { get; set; }

        public string MatchCode { get; set; }

        public DateTime KickOffTime { get; set; }

        private int HomeId { get; set; }

        private int AwayId { get; set; }

        public string HomeName => RefDataService.GetTeamName(HomeId);

        public string AwayName => RefDataService.GetTeamName(AwayId);

        public int? HtHomeScore { get; set; }

        public int? HtAwayScore { get; set; }

        public int? FinalHomeScore { get; set; }

        public int? FinalAwayScore { get; set; }

        private byte SettlementStatus { get; set; }

        private string BetStatus { get; set; }

        public string EventStatus
        {
            get
            {
                return eventStatus.MapToString(BetStatus, Remark.IsPending);
            }

            set
            {
                eventStatus = value;
            }
        }

        public RemarkSettingModel Remark => new RemarkSettingModel
        {
            SettlementStatus = Convert.ToString(SettlementStatus, ConvertToBase).Reverse()
        };
    }
}