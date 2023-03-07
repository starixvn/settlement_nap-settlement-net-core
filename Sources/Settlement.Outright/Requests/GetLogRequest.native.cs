using MediatR;

namespace Settlement.Outright.Requests;

public class GetLogRequest : IRequest<IEnumerable<OutrightLog>>
{
	public int LeagueId { get; set; }

	public string MatchCode { get; set; }

	public int? MatchId { get; set; }

	public DateTime FromDate { get; set; } = DateTime.Now.AddDays(-1);

	public DateTime ToDate { get; set; } = DateTime.Today;

	public DateTime BalanceUpDay { get; set; }

	public bool IsSubmit { get; set; }
}