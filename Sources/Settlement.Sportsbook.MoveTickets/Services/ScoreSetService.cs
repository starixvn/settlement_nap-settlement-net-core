using Settlement.Constants;
using Settlement.Models;

namespace Settlement.Sportsbook.MoveTickets.Services;

public interface IScoreSetService
{
    Score GetScore(ResultDetail item);
}

public class ScoreSetServiceImp : IScoreSetService
{
    public Score GetScore(ResultDetail item)
    {
        if (item.SettlementStatusId == SettlementStatus.Refund)
        {
            return new Score(SetStatus.Refund);
        }

        if (item.SettlementStatusId == SettlementStatus.RefundHt)
        {
            return new Score(SetStatus.RefundHt);
        }

        if (item.SettlementStatusId == SettlementStatus.RefundFt)
        {
            return new Score(SetStatus.RefundFt);
        }

        return item.SettlementStatusId == SettlementStatus.Completed
            ? new Score(ConvertScore(item.HomeValue), ConvertScore(item.AwayValue), Background.Calculated)
            : new Score(ConvertScore(item.HomeValue), ConvertScore(item.AwayValue));
    }

    private static string ConvertScore(string value)
    {
        return string.IsNullOrWhiteSpace(value) ? "-" : value;
    }
}