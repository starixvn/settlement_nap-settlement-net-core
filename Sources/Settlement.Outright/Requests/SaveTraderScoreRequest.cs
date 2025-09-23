using MediatR;
using Settlement.Core.Models;

namespace Settlement.Outright.Requests;

public class SaveTraderScoreRequest : IRequest<Result>
{
    public int LeagueId { get; set; }
    public IEnumerable<TeamResult> Teams { get; set; }
}
