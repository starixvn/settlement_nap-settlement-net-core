using Settlement.Core.Services;
using System.Text.Json.Serialization;

namespace Settlement.Core.Models
{
    public class MatchDetail
    {
        [JsonIgnore]
        public IRefDataService RefDataService { get; set; }

        public int SportType { get; set; }

        public string SportName => RefDataService.GetSportName(SportType);

        public int MatchId { get; set; }

        public string MatchCode { get; set; }

        public int LeagueId { get; set; }

        public string LeagueName => RefDataService.GetLeagueName(LeagueId);

        public string KickOffTime { get; set; }

        public int HomeId { get; set; }

        public string HomeName => RefDataService.GetTeamName(HomeId);

        public int AwayId { get; set; }

        public string AwayName => RefDataService.GetTeamName(AwayId);

        public int PlayTime { get; set; }

        public int? HalfTimeHomeScore { get; set; }

        public int? HalfTimeAwayScore { get; set; }

        public int? FinalHomeScore { get; set; }

        public int? FinalAwayScore { get; set; }

        public string BetStatus { get; set; }

        public bool IsHalftimeCal { get; set; }

        public int? ExHTHomeScore { get; set; }

        public int? ExHTAwayScore { get; set; }

        public int? ExFTHomeScore { get; set; }

        public int? ExFTAwayScore { get; set; }
    }
}
