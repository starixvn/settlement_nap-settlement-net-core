using Settlement.Core.Models;
using Settlement.Core.Constants;

namespace Settlement.EventManagement.Services
{
    public interface IScoreSetService
    {
        Score GetScore(ResultDetail item, Permission permission);
    }

    public class ScoreSetServiceImp : IScoreSetService
    {
        public Score GetScore(ResultDetail item, Permission permission)
        {
            const int resultConfirmedStatus = 3;
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

            var score = new Score(ConvertScore(item.HomeValue), ConvertScore(item.AwayValue))
            {
                IsConfirmed = item.SourceId == 0 && item.ResultStatusId == resultConfirmedStatus,
                IsNotSettled = true
            };

            if (permission != null && !permission.IsLeader)
            {
                score.Home = "-";
                score.Away = "-";
            }

            return score;
        }

        private static string ConvertScore(string value)
        {
            return string.IsNullOrWhiteSpace(value) ? "-" : value;
        }
    }
}