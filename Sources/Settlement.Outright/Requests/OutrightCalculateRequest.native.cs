using MediatR;
using Settlement.Models;

namespace Settlement.Outright.Requests;

public class OutrightCalculateRequest : IRequest<Result>
{
	public IEnumerable<TeamSettleModel> Teams { get; set; }

	public int DeadHeat { get; set; }
}