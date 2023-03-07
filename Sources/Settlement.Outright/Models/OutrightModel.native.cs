using Settlement.Core.Models;

namespace Settlement.Outright.Models;

public class OutrightModel
{
	public IEnumerable<LeagueMatch> LeagueMatch { get; set; }

	public Permission Permission { get; set; }
}