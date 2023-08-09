using Newtonsoft.Json;
using Settlement.Core.Services;

namespace Settlement.Sportsbook.Aio.Models;

public class MatchDetail
{
    [JsonIgnore]
    public IRefDataService RefDataService { get; set; }

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

    public int BestOfMap { get; set; }

    public int? HalfTimeHomeScore { get; set; }

    public int? HalfTimeAwayScore { get; set; }

    public int? FinalHomeScore { get; set; }

    public int? FinalAwayScore { get; set; }

    public string BetStatus { get; set; }

    public int ChildMatchType { get; set; }

    public bool IsHalftimeCal { get; set; }

    public int SportType { get; set; }

    public string SportName => RefDataService.GetSportName(SportType);

    public int ConfirmFT { get; set; }

    public string EventStatus { get; set; }

    public int LeagueGroupId { get; set; }

    public int GameType { get; set; }

    public int ParentId { get; set; }

    public int AutoSetting { get; set; }

    public bool IsFantasy
    {
        get
        {
            var leagueIds = new List<int> { 110131, 110132, 110133, 110134, 111441,
                 111443, 111444, 111445, 111442, 56037,
                 56053, 56069, 95746, 99321, 99329,
                 99367, 16926 , 97008, 109275, 109276,
                 109277, 109278, 109279 };

            return leagueIds.Contains(LeagueId);
        }
    }
}