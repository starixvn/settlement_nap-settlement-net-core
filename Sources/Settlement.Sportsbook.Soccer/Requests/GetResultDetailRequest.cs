using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Requests;
public class GetResultDetailRequest : IRequest<IEnumerable<ResultDetail>>
{
    public int MatchId { get; set; }
}
