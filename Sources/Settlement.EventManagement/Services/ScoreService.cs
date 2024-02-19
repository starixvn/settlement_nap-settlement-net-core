namespace Settlement.EventManagement.Services;

public interface ScoreService
{
    bool IsIntervalScore(int sportType, List<ResultDetail> resultDetails);

    Score[] ScoreOfSets(List<ResultDetail> resultDetails, List<string> resources, bool isLeader);

    Score HalftimeScore(int sportType, List<ResultDetail> resultDetails, bool isLeader);

    Score FinalScore(int sportType, List<ResultDetail> resultDetails, bool isLeader);
}

public class ScoreServiceImp(IScoreSetService scoreSetService) : ScoreService
{
    public bool IsIntervalScore(int sportType, List<ResultDetail> resultDetails)
    {
        return sportType == SportType.BasketBall
            ? resultDetails.Exists(item => !item.ResourceId.Equals(ResourceType.Halftime) && !item.ResourceId.Equals(ResourceType.Final))
            : resultDetails.Exists(item => !item.ResourceId.Equals(ResourceType.Final));
    }

    public Score[] ScoreOfSets(List<ResultDetail> resultDetails, List<string> resources, bool isLeader)
    {
        var quarterScore = new Score[resources.Count];
        var index = 0;
        foreach (var resource in resources)
        {
            quarterScore[index] = ScoreByResource(resultDetails, resource, isLeader);
            index++;
        }

        return quarterScore;
    }

    public Score HalftimeScore(int sportType, List<ResultDetail> resultDetails, bool isLeader)
    {
        List<int> totalPointSports = new() { SportType.BeachVolleyball, SportType.Badminton, SportType.VolleyBall };
        if (SportGroup.SupportSettleDetermine.Contains(sportType))
        {
            ClearScore(sportType, resultDetails, ResourceType.Halftime);
        }
        return totalPointSports.Contains(sportType)
            ? TotalPoints(resultDetails, sportType == SportType.BeachVolleyball)
            : ScoreByResource(resultDetails, ResourceType.Halftime, isLeader);
    }

    public Score FinalScore(int sportType, List<ResultDetail> resultDetails, bool isLeader)
    {
        if (SportGroup.SupportSettleDetermine.Contains(sportType))
        {
            ClearScore(sportType, resultDetails, ResourceType.Final);
        }
        return ScoreByResource(resultDetails, ResourceType.Final, isLeader);
    }

    private static void ClearScore(int sportType, List<ResultDetail> resultDetails, string resourceId)
    {
        var resultSettleSdt = resultDetails.Where(r => (resourceId == ResourceType.Halftime
            ? Resources.ResultHaftTime[sportType].Contains(r.ResourceId)
            : Resources.ResultFullTime[sportType].Contains(r.ResourceId)) && r.SettlementStatusId == SettlementStatus.Abandoned).ToList();
        var resultDetail = resultDetails.Find(n => n.ResourceId == resourceId);
        if (resultDetail != null && resultSettleSdt.Any())
        {
            resultDetail.HomeValue = string.Empty;
            resultDetail.AwayValue = string.Empty;
        }
    }

    private Score ScoreByResource(IEnumerable<ResultDetail> resultDetails, string resource, bool isLeader)
    {
        var resultDetail = resultDetails.FirstOrDefault(n => n.ResourceId == resource);

        var hasResult = resultDetail is { MatchId: > 0 };

        return hasResult ? scoreSetService.GetScore(resultDetail, isLeader) : new Score("-");
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