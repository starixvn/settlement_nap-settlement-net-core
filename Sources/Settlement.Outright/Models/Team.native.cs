using Settlement.Core.Services;

namespace Settlement.Outright.Models;

public class Team
{
    private string confirmedBy = "";
    private bool isDeadheat = false;

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

    //public bool IsDeadheat { get; set; }
    public bool? IsDeadHeatResultDetail { get; set; }


    public string OddsStatus { get; set; }
    public int BetCount { get; set; }

    public string ScreenShot { get; set; }
    public string TraderScore { get; set; }

    public int ResultStatusId { get; set; }
    public int ModifiedBy { get; set; }

    public string ConfirmedBy
    {
        set => confirmedBy = ResultStatusId == 3 || ResultStatusId == 5 ? value : string.Empty;
        get => confirmedBy;
    }

    public bool IsDeadheat
    {
        get
        {
            // If we have confirmed deadheat result detail, always use that
            if (IsDeadHeatResultDetail.HasValue && ResultStatusId == 3)
            {
                return IsDeadHeatResultDetail.Value;
            }
            return isDeadheat;
        }
        set
        {
            // Only allow setting if not overridden by result detail
            if (!(IsDeadHeatResultDetail.HasValue && ResultStatusId == 3))
            {
                isDeadheat = value;
            }
        }
    }
}