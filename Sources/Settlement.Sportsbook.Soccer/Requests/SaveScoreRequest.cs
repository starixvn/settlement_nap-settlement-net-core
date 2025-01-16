using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Requests;
public class SaveScoreRequest : IRequest<Result>
{
    public int MatchId { get; set; }

    public string HalfTimeHomeScore { get; set; }

    public string HalfTimeAwayScore { get; set; }

    public string FullTimeHomeScore { get; set; }

    public string FullTimeAwayScore { get; set; }

}
