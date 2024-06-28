using Settlement.Constants;
using Settlement.Models;

namespace Settlement.Services;

public interface IScoreSetService
{
    Score GetScore(ResultDetail item, bool isLeader);

    Score SumScore(IReadOnlyCollection<ResultDetail> resultDetails);
}

public class ScoreSetServiceImp : IScoreSetService
{
    public Score GetScore(ResultDetail item, bool isLeader)
    {
        if (item.SettlementStatusId == SettlementStatus.Refund)
        {
            return new Score(SetStatus.Refund);
        }
        if (item.SettlementStatusId == SettlementStatus.Abandoned)
        {
            return string.IsNullOrEmpty(item.HomeValue)
                || string.IsNullOrEmpty(item.AwayValue)
                ? new Score(SetStatus.Refund)
                : new Score(ConvertScore(item.HomeValue), ConvertScore(item.AwayValue));
        }

        if (item.SettlementStatusId == SettlementStatus.RefundHt)
        {
            return new Score(SetStatus.RefundHt);
        }

        if (item.SettlementStatusId == SettlementStatus.RefundFt)
        {
            return new Score(SetStatus.RefundFt);
        }

        if (item.SettlementStatusId == SettlementStatus.Completed)
        {
            return new Score(ConvertScore(item.HomeValue), ConvertScore(item.AwayValue), Background.Calculated);
        }

        var score = new Score(ConvertScore(item.HomeValue), ConvertScore(item.AwayValue))
        {
            IsConfirmed = item.SourceId == 0 && item.ResultStatusId == ResultStatus.Running,
            IsNotSettled = true
        };

        if (isLeader)
        {
            return score;
        }
        score.Home = "-";
        score.Away = "-";

        return score;
    }

    public Score SumScore(IReadOnlyCollection<ResultDetail> resultDetails)
    {
        if (resultDetails.Count == 0)
        {
            return new Score("-");
        }

        var home = resultDetails.Sum(m =>
        {
            int.TryParse(m.HomeValue, out var homeValue);
            return homeValue;
        });

        var away = resultDetails.Sum(m =>
        {
            int.TryParse(m.AwayValue, out var awayValue);
            return awayValue;
        });

        return new Score(home.ToString(), away.ToString());
    }

    private static string ConvertScore(string value)
    {
        return string.IsNullOrWhiteSpace(value) ? "-" : value;
    }
}