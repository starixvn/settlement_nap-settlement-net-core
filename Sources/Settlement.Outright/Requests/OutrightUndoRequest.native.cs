using MediatR;
using Settlement.Models;

namespace Settlement.Outright.Requests;

public class OutrightUndoRequest : IRequest<Result>
{
	public string MatchIds { get; set; }

	public string TeamIds { get; set; }
}