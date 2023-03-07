using Settlement.Core.Services;

namespace Settlement.Outright.Models;

public class OutrightLog
{
	public IRefDataService RefDataService { get; set; }

	public int OrId { get; set; }

	public string MatchCode { get; set; }

	public int TeamId { get; set; }

	public int LeagueId { get; set; }

	public List<OutrightLogDetail> OutrightLogDetails { get; set; } = new();

	public string LeagueName => RefDataService.GetLeagueName(LeagueId);
}