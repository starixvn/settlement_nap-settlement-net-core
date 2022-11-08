using Newtonsoft.Json;
using Settlement.Core.Models;
using Settlement.Core.Services;

namespace Settlement.ThirdPartyProducts.Models
{
    public class MatchDetailModel
    {
        private const int ConvertToBase = 2;

        private string eventStatus = string.Empty;

        private AutoSetting autoCalcSetting;

        [JsonIgnore]
        public IRefDataService RefDataService { get; set; }

        public int MatchId { get; set; }

        public int LeagueId { get; set; }

        public int SportType { get; set; }

        public string LeagueName => RefDataService.GetLeagueName(LeagueId);

        public string SportName => RefDataService.GetSportName(SportType);

        public int HomeId { get; set; }

        public string HomeName => RefDataService.GetTeamName(HomeId);

        public int AwayId { get; set; }

        public string AwayName => RefDataService.GetTeamName(AwayId);

        public string MatchCode { get; set; }

        public DateTime KickOffTime { get; set; }

        public string BetStatus { get; set; }

        public byte SettlementStatus { get; set; }

        public int QueueStatus { get; set; }

        public bool IsPending
        {
            get
            {
                var status = Convert.ToString(SettlementStatus, ConvertToBase).Reverse();
                return !string.IsNullOrWhiteSpace(status) && status[0].Equals('1');
            }
        }

        public string EventStatus
        {
            get
            {
                return eventStatus.MapToString(BetStatus, IsPending);
            }

            set
            {
                eventStatus = value;
            }
        }

        public string ParlayStatus { get; set; }

        public int AutoSetting { get; set; }

        public int AutoSettingForLeague { get; set; }

        public List<SiteMatch> SiteMatch { get; set; } = new List<SiteMatch>();

        public AutoSetting AutoCalcSetting => autoCalcSetting ?? (autoCalcSetting = new AutoSetting
        {
            MatchSetting = Convert.ToString(AutoSetting, ConvertToBase).Reverse(),
            LeagueSetting = Convert.ToString(AutoSettingForLeague, ConvertToBase).Reverse()
        });

        public MoreScores MoreScores { get; set; }

        public bool IsShowLink { get; set; } = true;

        public int TotalTickets { get; set; }

        public int TotalTicketsRunning { get; set; }

        public override bool Equals(object obj)
        {
            return obj is MatchDetailModel match && match.MatchId == MatchId;
        }

        public override int GetHashCode()
        {
            return MatchId;
        }
    }
}