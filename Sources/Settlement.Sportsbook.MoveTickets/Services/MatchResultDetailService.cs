using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using System.Collections.Generic;
using System.Linq;

namespace Settlement.Sportsbook.MoveTickets.Services;

public interface IMatchResultDetailService
{
    List<Match> CricketResultDetail(List<Match> matches, List<ResultDetail> resultDetails);
}

public class MatchResultDetailServiceImp : IMatchResultDetailService
{
    private readonly IRefDataService refDataService;

    private readonly IScoreService scoreService;

    public MatchResultDetailServiceImp(
        IRefDataService refDataService,
        IScoreService scoreService)
    {
        this.refDataService = refDataService;
        this.scoreService = scoreService;
    }

    public List<Match> CricketResultDetail(List<Match> matches, List<ResultDetail> resultDetails)
    {
        var resources = new List<string> { "H1", "H2", "A1", "A2" };
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