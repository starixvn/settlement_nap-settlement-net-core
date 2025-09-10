
using MediatR;
using Settlement.Core.Models;

namespace Settlement.Outright.Requests;

public class SaveScoreRequest : IRequest<Result>
{
    public IEnumerable<TeamExternalResult> Teams { get; set; }
}