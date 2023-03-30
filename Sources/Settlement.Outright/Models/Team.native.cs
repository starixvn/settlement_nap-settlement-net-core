using Settlement.Core.Services;

namespace Settlement.Outright.Models;

public class Team
{
	public IRefDataService RefDataService { get; set; }

	public int OrId { get; set; }

	public int LeagueId { get; set; }

	public int TeamId { get; set; }

	public string MatchCode { get; set; }

	public DateTime KickOffTime { get; set; }

	public DateTime EventDate { get; set; }

	public string Status { get; set; }

	public int SportType { get; set; }

	public string TeamName => RefDataService.GetTeamName(TeamId);

	public string SportName => RefDataService.GetSportName(SportType);

	public string LeagueName => RefDataService.GetLeagueName(LeagueId);

	public bool IsDeadheat { get; set; }

	public string OddsStatus { get; set; }
	public int BetCount { get; set; }
}