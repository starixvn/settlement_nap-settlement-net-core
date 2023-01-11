using MediatR;
using Settlement.Core.Models;

namespace Settlement.Outright.Requests;

public class SettleRequest : IRequest<Result>
{
    public string MatchIds { get; set; }

    public string TeamIds { get; set; }

    public string Action { get; set; }
}