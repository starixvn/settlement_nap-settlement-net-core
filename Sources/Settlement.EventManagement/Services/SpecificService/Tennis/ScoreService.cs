using Settlement.Core.Models;

namespace Settlement.EventManagement.Services.SpecificService.Tennis;

public interface IScoreService
{
    bool IsRefundMatch(string totalSetHomeValue);

    Score TotalGame(string totalSetHomeValue, Score totalScore);

    Score ScoreSet(List<ResultDetail> resultDetails);
}

public class ScoreServiceImp : IScoreService
{
    public Score TotalGame(string totalSetHomeValue, Score totalScore)
    {
        return IsRefundMatch(totalSetHomeValue) ? new Score(SetStatus.Refund, SetStatus.Refund) : totalScore;
    }

    public bool IsRefundMatch(string totalSetHomeValue)
    {
        return !string.IsNullOrWhiteSpace(totalSetHomeValue) && totalSetHomeValue.Equals(SetStatus.Refund);
    }

    public Score ScoreSet(List<ResultDetail> resultDetails)
    {
        var resultHasScore = resultDetails.Where(m => !string.IsNullOrWhiteSpace(m.HomeValue)
                                                      && !string.IsNullOrWhiteSpace(m.AwayValue)
                                                      && m.ResultStatusId == ResultStatus.ManuallySettled).ToList();

        if (resultHasScore.Count > 0)
        {
            var home = resultHasScore.Sum(m =>
            {
                int.TryParse(m.HomeValue, out var homeValue);
                return homeValue;
            });

            var away = resultHasScore.Sum(m =>
            {
                int.TryParse(m.AwayValue, out var awayValue);
                return awayValue;
            });
            return new Score(home.ToString(), away.ToString());
        }

        return new Score("-");
    }
}