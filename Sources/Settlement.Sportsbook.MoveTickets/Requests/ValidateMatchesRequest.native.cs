using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.MoveTickets.Requests;

public class ValidateMatchesRequest : IRequest<Result>
{
    public int MatchId { get; set; }

    public int TargetMatchId { get; set; }

    public bool IsOverrideResult { get; set; }
}