namespace Settlement.EventManagement.Services;

public interface ScoreTennisService
{
    string GetEventStatus(IEnumerable<ResultDetail> resultDetails, string currentStatus);

    MoreScores ScoreLoader(List<ResultDetail> resultDetails, Permission permission);
}

public class ScoreTennisServiceImp(IScoreSetService scoreSetService) : ScoreTennisService
{
    private readonly List<string> setResource = ["01", "02", "03", "04", "05"];

    public string GetEventStatus(IEnumerable<ResultDetail> resultDetails, string currentStatus)
    {
        var totalSet = resultDetails.FirstOrDefault(n => n.ResourceId == ResourceType.Final);

        return totalSet != null && IsRefundMatch(totalSet.HomeValue) ? BetStatus.Refund : currentStatus;
    }

    public MoreScores ScoreLoader(List<ResultDetail> resultDetails, Permission permission)
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

        var totalSet = resultDetails.Find(n => n.ResourceId == ResourceType.Final);
        if (totalSet is { MatchId: > 0 })
        {
            moreScore.FinalScore = scoreSetService.GetScore(totalSet, permission);
            moreScore.HalfTimeScore = TotalGame(moreScore.FinalScore.Home, items);
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

    private Score TotalGame(string totalSetHomeValue, IEnumerable<ResultDetail> resultDetails)
    {
        return IsRefundMatch(totalSetHomeValue) ? new Score(SetStatus.Refund, SetStatus.Refund) : GetTotalGame(resultDetails);
    }

    private static bool IsRefundMatch(string totalSetHomeValue)
    {
        return !string.IsNullOrWhiteSpace(totalSetHomeValue) && totalSetHomeValue.Equals(SetStatus.Refund);
    }
}