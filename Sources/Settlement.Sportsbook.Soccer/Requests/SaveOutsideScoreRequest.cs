using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Requests;

public class SaveOutsideScoreRequest
{
    public int MatchId { get; set; }

    public IList<ResultDetail> CheckedResults { get; set; }
    public IList<ResultDetail> OutsideResults { get; set; }
}
