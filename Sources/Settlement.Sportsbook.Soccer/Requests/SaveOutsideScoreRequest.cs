using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Requests;

public class SaveOutsideScoreRequest : IRequest<Result>
{
    public int MatchId { get; set; }

    public List<SaveScoreModel> ScoresToSave { get; set; }

    public List<SaveScoreModel> CheckedScores { get; set; }
}
