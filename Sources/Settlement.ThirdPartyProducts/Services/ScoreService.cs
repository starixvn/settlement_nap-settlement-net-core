using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;

namespace Settlement.ThirdPartyProducts.Services;

public interface ScoreService
{
    Score[] ScoreOfSets(List<ResultDetail> resultDetails, int sportType, bool isPopup);

    Score HalftimeScore(List<ResultDetail> resultDetails, int sportType);

    Score FinalScore(List<ResultDetail> resultDetails, int sportType);
}

public class ScoreServiceImp : ScoreService
{
    private const string Halftime = "01";
    private const string Final = "00";
    private readonly List<string> basketBallResources = new() { "Q1", "Q2", "Q3", "Q4", "OT" };
    private readonly IScoreSetService scoreSetService;

    public ScoreServiceImp(IScoreSetService scoreSetService)
    {
        this.scoreSetService = scoreSetService;
    }

    public Score[] ScoreOfSets(List<ResultDetail> resultDetails, int sportType, bool isPopup)
    {
        var isDisplayIntervalScore = resultDetails.Exists(item => !item.ResourceId.Equals(ResourceType.Halftime) && !item.ResourceId.Equals(ResourceType.Final));
        if ((sportType == SportType.BasketBall && isDisplayIntervalScore) || isPopup)
        {
            var quarterScore = new Score[basketBallResources.Count];
            var index = 0;
            foreach (var resource in basketBallResources)
            {
                quarterScore[index] = ScoreByResource(resultDetails, resource, sportType);
                index++;
            }
            return quarterScore;
        }

        return new Score[] { };
    }

    public Score HalftimeScore(List<ResultDetail> resultDetails, int sportType)
    {
        return ScoreByResource(resultDetails, Halftime, sportType);
    }

    public Score FinalScore(List<ResultDetail> resultDetails, int sportType)
    {
        return ScoreByResource(resultDetails, Final, sportType);
    }

    private Score ScoreByResource(List<ResultDetail> resultDetails, string resource, int sportType)
    {
        var resultDetail = resultDetails.Find(n => n.ResourceId == resource);

        var hasResult = resultDetail is { MatchId: > 0 };

        if (sportType == SportType.Soccer && hasResult)
        {
            resultDetail.SettlementStatusId = SettlementStatus.Running;
        }

        return hasResult ? scoreSetService.GetScore(resultDetail, false) : new Score("-");
    }
}