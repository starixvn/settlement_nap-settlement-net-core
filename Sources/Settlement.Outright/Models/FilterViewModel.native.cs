using Settlement.Core.Models;

namespace Settlement.Outright.Models;

public class FilterViewModel
{
	public IEnumerable<Sport> Sports { get; set; }

	public IEnumerable<League> Leagues { get; set; }

	public DateTime MoveBetsDay { get; set; }

	public DateTime FromDate { get; set; }

	public DateTime ToDate { get; set; }
}