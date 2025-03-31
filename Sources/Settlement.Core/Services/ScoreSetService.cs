using Settlement.Core.Constants;
using Settlement.Core.Models;

namespace Settlement.Core.Services;

public interface IScoreSetService
{
    Score GetScore(ResultDetail item, bool isLeader);

    Score SumScore(IReadOnlyCollection<ResultDetail> resultDetails);
}

public class ScoreSetServiceImp : IScoreSetService
{
    // TODO
    public Score GetScore(ResultDetail item, bool isLeader)
    {
        if (item.SettlementStatusId == SettlementStatus.Refund)
        {
            return CreateRefundScore();
        }

        if (item.SettlementStatusId == SettlementStatus.Abandoned)
        {
            return CreateAbandonedScore(item);
        }

        if (item.SettlementStatusId == SettlementStatus.RefundHt)
        {
            return new Score(SetStatus.RefundHt);
        }

        if (item.SettlementStatusId == SettlementStatus.RefundFt)
        {
            return new Score(SetStatus.RefundFt);
        }

        return item.SettlementStatusId == SettlementStatus.Completed ? CreateCompletedScore(item) : CreateDefaultScore(item, isLeader);
    }

    private static Score CreateDefaultScore(ResultDetail item, bool isLeader)
    {
        var score = new Score(ConvertScore(item.HomeValue), ConvertScore(item.AwayValue))
        {
            IsConfirmed = item.SourceId == 0 && item.ResultStatusId == ResultStatus.Confirmed,
            IsNotSettled = true
        };

        var isRunningResult = item.ResultStatusId is null or ResultStatus.Initial or ResultStatus.Live;

        if (isRunningResult || !isLeader)
        {
            score.Home = "-";
            score.Away = "-";
        }

        return score;
    }

    private static Score CreateCompletedScore(ResultDetail item)
    {
        return new Score(ConvertScore(item.HomeValue), ConvertScore(item.AwayValue), Background.Calculated);
    }

    private static Score CreateRefundScore()
    {
        return new Score(SetStatus.Refund);
    }

    private static Score CreateAbandonedScore(ResultDetail item)
    {
        return string.IsNullOrEmpty(item.HomeValue) || string.IsNullOrEmpty(item.AwayValue)
            ? CreateRefundScore()
            : new Score(ConvertScore(item.HomeValue), ConvertScore(item.AwayValue));
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