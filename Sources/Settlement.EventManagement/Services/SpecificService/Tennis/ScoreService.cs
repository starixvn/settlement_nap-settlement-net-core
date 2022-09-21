using Settlement.Core.Constants;
using Settlement.Core.Models;

namespace Settlement.EventManagement.Services.SpecificService.Tennis
{
    public interface IScoreService
    {
        bool IsRefundMatch(string totalSetHomeValue);

        Score TotalGame(string totalSetHomeValue, Score totalScore);

        Score ScoreSet(ResultDetail resultDetail);
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

        public Score ScoreSet(ResultDetail resultDetail)
        {
            var homeScore = 0;
            var awayScore = 0;

            if (HasScore(resultDetail.SettlementStatusId))
            {
                if (int.TryParse(resultDetail.HomeValue, out var homeValue))
                {
                    homeScore += homeValue;
                }

                if (int.TryParse(resultDetail.AwayValue, out var awayValue))
                {
                    awayScore += awayValue;
                }
            }

            return new Score(homeScore.ToString(), awayScore.ToString());
        }

        private static bool HasScore(byte? statusId)
        {
            return Equals(statusId, SettlementStatus.Completed) || Equals(statusId, SettlementStatus.Running);
        }
    }
}