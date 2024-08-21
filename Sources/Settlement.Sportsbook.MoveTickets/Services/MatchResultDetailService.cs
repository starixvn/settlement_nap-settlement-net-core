using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;

namespace Settlement.Sportsbook.MoveTickets.Services;

public interface IMatchResultDetailService
{
    List<Match> CricketResultDetail(List<Match> matches, List<ResultDetail> resultDetails);

    List<Match> BaseballResultDetail(List<Match> matches, List<ResultDetail> resultDetails);
}

public class MatchResultDetailServiceImp(
    IRefDataService refDataService,
    IScoreService scoreService)
    : IMatchResultDetailService
{
    public List<Match> CricketResultDetail(List<Match> matches, List<ResultDetail> resultDetails)
    {
        var resources = new List<string> { "H1", "H2", "A1", "A2" };
        return SetMatchInfo(matches, resultDetails, resources);
    }

    public List<Match> BaseballResultDetail(List<Match> matches, List<ResultDetail> resultDetails)
    {
        var resources = new List<string> { "0101", "0102", "0103", "0104", "0105", "0106", "0107", "0108", "0109", "EI" };
        return SetMatchInfo(matches, resultDetails, resources);
    }

    private List<Match> SetMatchInfo(List<Match> matches, List<ResultDetail> resultDetails, List<string> resources)
    {
        foreach (var match in matches)
        {
            match.RefDataService = refDataService;
            var resultDetailByMatchId = resultDetails.Where(m => m.MatchId == match.MatchId && m.SourceId == SourceType.Normal).ToList();
            match.MoreScores = scoreService.ScoreLoader(resultDetailByMatchId, resources);
            match.IsHavingIntervalScore = IsDisplayIntervalScore(resultDetailByMatchId);
        }

        return matches;
    }

    private static bool IsDisplayIntervalScore(List<ResultDetail> resultDetails)
    {
        return resultDetails.Exists(item => !item.ResourceId.Equals(ResourceType.Final));
    }
}