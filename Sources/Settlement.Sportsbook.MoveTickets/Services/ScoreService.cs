using Settlement.Core.Models;

namespace Settlement.Sportsbook.MoveTickets.Services;

public interface IScoreService
{
    Score[] ScoreOfSets(List<ResultDetail> resultDetails, List<string> resources);

    Score HalftimeScore(List<ResultDetail> resultDetails);

    Score FinalScore(List<ResultDetail> resultDetails);

    MoreScores ScoreLoader(List<ResultDetail> resultDetails, List<string> resources);
}

public class ScoreServiceImp : IScoreService
{
    private const string Halftime = "01";
    private const string Final = "00";

    private readonly IScoreSetService scoreSetService;

    public ScoreServiceImp(IScoreSetService scoreSetService)
    {
        this.scoreSetService = scoreSetService;
    }

    public Score[] ScoreOfSets(List<ResultDetail> resultDetails, List<string> resources)
    {
        var quarterScore = new Score[resources.Count];
        var index = 0;
        foreach (var resource in resources)
        {
            quarterScore[index] = ScoreByResource(resultDetails, resource);
            index++;
        }

        return quarterScore;
    }

    public Score HalftimeScore(List<ResultDetail> resultDetails)
    {
        return ScoreByResource(resultDetails, Halftime);
    }

    public Score FinalScore(List<ResultDetail> resultDetails)
    {
        return ScoreByResource(resultDetails, Final);
    }

    public MoreScores ScoreLoader(List<ResultDetail> resultDetails, List<string> resources)
    {
        return new MoreScores
        {
            HalfTimeScore = HalftimeScore(resultDetails),
            FinalScore = FinalScore(resultDetails),
            Sets = ScoreOfSets(resultDetails, resources)
        };
    }

    private Score ScoreByResource(List<ResultDetail> resultDetails, string resource)
    {
        var resultDetail = resultDetails.FirstOrDefault(n => n.ResourceId == resource);

        var hasResult = resultDetail != null && resultDetail.MatchId > 0;

        return hasResult ? scoreSetService.GetScore(resultDetail) : new Score("-");
    }
}