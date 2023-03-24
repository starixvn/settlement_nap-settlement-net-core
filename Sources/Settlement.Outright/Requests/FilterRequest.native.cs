using MediatR;

namespace Settlement.Outright.Requests;

public class FilterRequest : IRequest<OutrightModel>
{
	public DateTime FromDate { get; set; }

	public DateTime ToDate { get; set; }

	public string LeagueIds { get; set; }

	public byte StatusId { get; set; }

	public bool IsIncludeTest { get; set; }
}