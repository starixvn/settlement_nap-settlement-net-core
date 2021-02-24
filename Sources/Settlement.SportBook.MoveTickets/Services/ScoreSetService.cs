using Settlement.Core.Constants;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.MoveTickets.Services
{
    public interface IScoreSetService
    {
        Score GetScore(ResultDetail item);
    }

    public class ScoreSetService : IScoreSetService
    {
        public Score GetScore(ResultDetail item)
        {
            if (item.SettlementStatusId == SettlementStatus.Refund)
            {
                return new Score(SetStatus.Refund);
            }

            if (item.SettlementStatusId == SettlementStatus.RefundHT)
            {
                return new Score(SetStatus.RefundHt);
            }

            if (item.SettlementStatusId == SettlementStatus.RefundFT)
            {
                return new Score(SetStatus.RefundFt);
            }

            if (item.SettlementStatusId == SettlementStatus.Completed)
            {
                return new Score(ConvertScore(item.HomeValue), ConvertScore(item.AwayValue), Background.Calculated);
            }

            return new Score(ConvertScore(item.HomeValue), ConvertScore(item.AwayValue));
        }

        private static string ConvertScore(string value)
        {
            return string.IsNullOrWhiteSpace(value) ? "-" : value;
        }
    }
}