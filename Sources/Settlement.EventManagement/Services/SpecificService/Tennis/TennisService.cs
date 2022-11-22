using Settlement.Core.Models;
using Settlement.Core.Services;
using Match = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.Services.SpecificService.Tennis;

public interface ITennisService
{
    MoreScores ScoreLoader(Match match, List<ResultDetail> resultDetails, Permission permission);
}

public class TennisServiceImp : ITennisService
{
    private readonly IScoreService scoreService;

    private readonly IScoreSetService scoreSetService;

    private readonly List<string> setResource = new List<string> { "01", "02", "03", "04", "05" };

    public TennisServiceImp(
        IScoreSetService scoreSetService,
        IScoreService scoreService)
    {
        this.scoreSetService = scoreSetService;
        this.scoreService = scoreService;
    }

    public MoreScores ScoreLoader(Match match, List<ResultDetail> resultDetails, Permission permission)
    {
        var moreScore = new MoreScores
        {
            Sets = setResource.Select(x => new Score("-")).ToArray(),
            HalfTimeScore = new Score("-"),
            FinalScore = new Score("-")
        };

        var items = resultDetails.OrderBy(n => n.ResourceId).ToList();
        var totalGame = scoreService.ScoreSet(items);
        foreach (var item in items)
        {
            if (setResource.Contains(item.ResourceId))
            {
                var scoreSet = scoreSetService.GetScore(item, permission);
                moreScore.Sets[int.Parse(item.ResourceId) - 1] = scoreSet;
            }
        }
        var totalSet = items.FirstOrDefault(n => n.ResourceId == ResourceType.Final);

        match.EventStatus = GetEventStatus(totalSet, match.EventStatus);

        if (totalSet != null && totalSet.MatchId > 0)
        {
            moreScore.FinalScore = scoreSetService.GetScore(totalSet, permission);
            moreScore.HalfTimeScore = scoreService.TotalGame(moreScore.FinalScore.Home, totalGame);
        }

        return moreScore;
    }

    private string GetEventStatus(ResultDetail totalSet, string currentStatus)
    {
        return totalSet != null && scoreService.IsRefundMatch(totalSet.HomeValue) ? "Refund" : currentStatus;
    }
}