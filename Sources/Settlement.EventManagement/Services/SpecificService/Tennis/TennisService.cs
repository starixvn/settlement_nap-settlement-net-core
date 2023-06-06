namespace Settlement.EventManagement.Services.SpecificService.Tennis;

using Settlement.Core.Models;
using Settlement.Core.Services;
using Match = Models.MultiSports.Match;

public interface ITennisService
{
    string GetEventStatus(IEnumerable<ResultDetail> resultDetails, string currentStatus);

    MoreScores ScoreLoader(Match match, List<ResultDetail> resultDetails, Permission permission);
}

public class TennisServiceImp : ITennisService
{
    private readonly IScoreService scoreService;

    private readonly IScoreSetService scoreSetService;

    private readonly List<string> setResource = new() { "01", "02", "03", "04", "05" };

    public TennisServiceImp(
        IScoreSetService scoreSetService,
        IScoreService scoreService)
    {
        this.scoreSetService = scoreSetService;
        this.scoreService = scoreService;
    }

    public string GetEventStatus(IEnumerable<ResultDetail> resultDetails, string currentStatus)
    {
        var totalSet = resultDetails.FirstOrDefault(n => n.ResourceId == ResourceType.Final);

        return totalSet != null && scoreService.IsRefundMatch(totalSet.HomeValue) ? BetStatus.Refund : currentStatus;
    }

    public MoreScores ScoreLoader(Match match, List<ResultDetail> resultDetails, Permission permission)
    {
        var moreScore = new MoreScores
        {
            Sets = setResource.Select(_ => new Score("-")).ToArray(),
            HalfTimeScore = new Score("-"),
            FinalScore = new Score("-")
        };

        var items = resultDetails.Where(item => setResource.Contains(item.ResourceId)).OrderBy(n => n.ResourceId).ToList();

        foreach (var item in items)
        {
            var scoreSet = scoreSetService.GetScore(item, permission);
            moreScore.Sets[int.Parse(item.ResourceId) - 1] = scoreSet;
        }

        var totalSet = resultDetails.FirstOrDefault(n => n.ResourceId == ResourceType.Final);
        if (totalSet is { MatchId: > 0 })
        {
            var totalGame = GetTotalGame(items);
            moreScore.FinalScore = scoreSetService.GetScore(totalSet, permission);
            moreScore.HalfTimeScore = scoreService.TotalGame(moreScore.FinalScore.Home, totalGame);
        }

        return moreScore;
    }

    private Score GetTotalGame(IEnumerable<ResultDetail> resultDetails)
    {
        var resultHasScore = resultDetails.Where(m => !string.IsNullOrWhiteSpace(m.HomeValue)
                                                      && !string.IsNullOrWhiteSpace(m.AwayValue)
                                                      && m.ResultStatusId is ResultStatus.ManuallySettled or ResultStatus.AutoSettled).ToList();

        return scoreSetService.SumScore(resultHasScore);
    }


}