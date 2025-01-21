using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Requests;
public class SaveScoreRequest : IRequest<Result>
{
    public int MatchId { get; set; }

    public IList<ResultDetail> ResultDetails { get; set; }

}
