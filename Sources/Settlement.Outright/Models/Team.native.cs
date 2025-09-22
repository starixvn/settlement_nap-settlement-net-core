using Settlement.Core.Services;

namespace Settlement.Outright.Models;

public class Team
{
    private string screenShot = "Running";
    public IRefDataService RefDataService { get; set; }

    public int OrId { get; set; }

    public int LeagueId { get; set; }

    public int TeamId { get; set; }

    public string MatchCode { get; set; }

    public DateTime KickOffTime { get; set; }

    public DateTime EventDate { get; set; }

    public string Status { get; set; }

    public int SportType { get; set; }

    public int TotalCal { get; set; }

    public int TotalRunning { get; set; }

    public int TotalHide { get; set; }

    public string TeamName => RefDataService.GetTeamName(TeamId);

    public string SportName => RefDataService.GetSportName(SportType);

    public string LeagueName => RefDataService.GetLeagueName(LeagueId);

    public bool IsDeadheat { get; set; }

    public string OddsStatus { get; set; }
    public int BetCount { get; set; }

    public string ScreenShot { get; set; }
    public string TraderScore { get; set; }

    public int ResultStatusId { get; set; }
    public int ModifiedBy { get; set; }

    public int ConfirmedBy => ResultStatusId == 3 ? ModifiedBy : default;
}