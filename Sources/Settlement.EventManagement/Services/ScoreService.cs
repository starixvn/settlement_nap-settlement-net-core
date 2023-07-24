namespace Settlement.EventManagement.Services;

public interface ScoreService
{
    bool IsIntervalScore(int sportType, List<ResultDetail> resultDetails);

    Score[] ScoreOfSets(List<ResultDetail> resultDetails, List<string> resources, Permission permission);

    Score HalftimeScore(int sportType, List<ResultDetail> resultDetails, Permission permission);

    Score FinalScore(int sportType, List<ResultDetail> resultDetails, Permission permission);
}

public class ScoreServiceImp : ScoreService
{
    private readonly List<int> totalPointSports = new() { SportType.BeachVolleyball, SportType.Badminton, SportType.VolleyBall };

    private readonly IScoreSetService scoreSetService;

    public ScoreServiceImp(IScoreSetService scoreSetService)
    {
        this.scoreSetService = scoreSetService;
    }

    public bool IsIntervalScore(int sportType, List<ResultDetail> resultDetails)
    {
        return sportType == SportType.BasketBall
            ? resultDetails.Exists(item => !item.ResourceId.Equals(ResourceType.Halftime) && !item.ResourceId.Equals(ResourceType.Final))
            : resultDetails.Exists(item => !item.ResourceId.Equals(ResourceType.Final));
    }

    public Score[] ScoreOfSets(List<ResultDetail> resultDetails, List<string> resources, Permission permission)
    {
        var quarterScore = new Score[resources.Count];
        var index = 0;
        foreach (var resource in resources)
        {
            quarterScore[index] = ScoreByResource(resultDetails, resource, permission);
            index++;
        }

        return quarterScore;
    }

    public Score HalftimeScore(int sportType, List<ResultDetail> resultDetails, Permission permission)
    {
        if (SportGroup.SupportSettleDetermine.Contains(sportType))
        {
            ClearScore(sportType, resultDetails, ResourceType.Halftime);
        }
        return totalPointSports.Contains(sportType)
            ? TotalPoints(resultDetails, sportType == SportType.BeachVolleyball)
            : ScoreByResource(resultDetails, ResourceType.Halftime, permission);
    }

    public Score FinalScore(int sportType, List<ResultDetail> resultDetails, Permission permission)
    {
        if (SportGroup.SupportSettleDetermine.Contains(sportType))
        {
            ClearScore(sportType, resultDetails, ResourceType.Final, false);
        }
        return ScoreByResource(resultDetails, ResourceType.Final, permission);
    }

    private static void ClearScore(int sportType, List<ResultDetail> resultDetails, string resource, bool isHalfTime = true)
    {
        var resultSettleSdt = resultDetails.Where(r => (isHalfTime
            ? Resources.ResultHaftTime[sportType].Contains(r.ResourceId)
            : Resources.ResultFullTime[sportType].Contains(r.ResourceId)) && r.SettlementStatusId == SettlementStatus.Abandoned).ToList();
        var resultDetail = resultDetails.FirstOrDefault(n => n.ResourceId == resource);
        if (resultDetail != null && resultSettleSdt.Any())
        {
            resultDetail.HomeValue = string.Empty;
            resultDetail.AwayValue = string.Empty;
        }
    }

    private Score ScoreByResource(IEnumerable<ResultDetail> resultDetails, string resource, Permission permission)
    {
        var resultDetail = resultDetails.FirstOrDefault(n => n.ResourceId == resource);

        var hasResult = resultDetail is { MatchId: > 0 };

        return hasResult ? scoreSetService.GetScore(resultDetail, permission) : new Score("-");
    }

    private static List<ResultDetail> ResultDetailsFilter(IEnumerable<ResultDetail> resultDetails, bool isBeachVolleyball)
    {
        var settledStatuses = new List<byte?> { ResultStatus.AutoSettled, ResultStatus.ManuallySettled };
        var validGames = resultDetails.Where(result => result.ResourceId.Length == 4
                                                       && !string.IsNullOrWhiteSpace(result.HomeValue)
                                                       && !string.IsNullOrWhiteSpace(result.AwayValue)).ToList();

        return validGames.Where(m => (isBeachVolleyball && m.SettlementStatusId != SettlementStatus.Refund)
                                           || (!isBeachVolleyball && settledStatuses.Contains(m.ResultStatusId))).ToList();
    }

    private Score TotalPoints(IReadOnlyCollection<ResultDetail> resultDetails, bool isBeachVolleyball)
    {
        if (IsRefundMatch(resultDetails))
        {
            return new Score(SetStatus.Refund);
        }

        var validGames = ResultDetailsFilter(resultDetails, isBeachVolleyball);

        return scoreSetService.SumScore(validGames);
    }

    private static bool IsRefundMatch(IEnumerable<ResultDetail> resultDetails)
    {
        return resultDetails.Count(m => m.ResourceId.Equals(ResourceType.Final) && m.SettlementStatusId == SettlementStatus.Refund) == 1;
    }
}