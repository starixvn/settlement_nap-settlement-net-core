using Settlement.Core.Models;
using Settlement.Core.Services;

namespace Settlement.Sportsbook.MoveTickets.Models;

public class MoveTicketsMatchDetail
{
    public IRefDataService RefDataService { get; set; }

    public int MatchId { get; set; }

    public string MatchCode { get; set; }

    public DateTime KickOffTime { get; set; }

    public int HomeId { get; set; }

    public int AwayId { get; set; }

    public string HomeName => RefDataService.GetTeamName(HomeId);

    public string AwayName => RefDataService.GetTeamName(AwayId);

    public int LeagueId { get; set; }

    public string LeagueName => RefDataService.GetLeagueName(LeagueId);

    public byte SettlementStatus { get; set; }

    public string EventStatus { get; set; }

    public bool HasChildMatch { get; set; }

    public RemarkSettingModel Remark => new RemarkSettingModel(SettlementStatus);
}