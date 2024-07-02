using Settlement.Constants;
using Settlement.Models;

namespace Settlement.Sportsbook.MoveTickets.Services;

public interface IScoreSetService
{
    Score GetScore(ResultDetail item);
}

public class ScoreSetServiceImp : IScoreSetService
{
    public Score GetScore(ResultDetail item) => item.SettlementStatusId switch
    {
        SettlementStatus.Refund => new Score(SetStatus.Refund),
        SettlementStatus.RefundHt => new Score(SetStatus.RefundHt),
        SettlementStatus.RefundFt => new Score(SetStatus.RefundFt),
        SettlementStatus.Completed => new Score(ConvertScore(item.HomeValue), ConvertScore(item.AwayValue),
            Background.Calculated),
        _ => new Score(ConvertScore(item.HomeValue), ConvertScore(item.AwayValue))
    };

    private static string ConvertScore(string value) => string.IsNullOrWhiteSpace(value) ? "-" : value;
}