using Settlement.Core.Models;
using System.Collections.Generic;
using System.Linq;
using Settlement.Core.Constants;
using Settlement.Core.Services;

namespace Settlement.EventManagement.Services
{
    public interface IScoreService
    {
        Score[] ScoreOfSets(List<ResultDetail> resultDetails, List<string> resources, Permission permission);

        Score HalftimeScore(int sportType, List<ResultDetail> resultDetails, Permission permission);

        Score FinalScore(List<ResultDetail> resultDetails, Permission permission);

        MoreScores ScoreLoader(int sportType, List<ResultDetail> resultDetails, List<string> resources, Permission permission);
    }

    public class ScoreServiceImp : IScoreService
    {
        private const string Halftime = "01";
        private const string Final = "00";
        private readonly List<int> totalPointSports = new List<int> { SportType.BeachVolleyball, SportType.Badminton, SportType.VolleyBall };

        private readonly IScoreSetService scoreSetService;

        public ScoreServiceImp(IScoreSetService scoreSetService)
        {
            this.scoreSetService = scoreSetService;
        }

        public Score[] ScoreOfSets(List<ResultDetail> resultDetails, List<string> resources, Permission permission)
        {
            var quarterScore = new Score[resources.Count];
            var index = 0;
            foreach (var resource in resources)
            {
                quarterScore[index] = ScoreByResource(resultDetails, resource, permission);
                index++;
            }

            return quarterScore;
        }

        public Score HalftimeScore(int sportType, List<ResultDetail> resultDetails, Permission permission)
        {
            return totalPointSports.Contains(sportType)
                ? TotalPoints(resultDetails)
                : ScoreByResource(resultDetails, Halftime, permission);
        }

        public Score FinalScore(List<ResultDetail> resultDetails, Permission permission)
        {
            return ScoreByResource(resultDetails, Final, permission);
        }

        public MoreScores ScoreLoader(int sportType, List<ResultDetail> resultDetails, List<string> resources, Permission permission)
        {
            return new MoreScores
            {
                HalfTimeScore = HalftimeScore(sportType, resultDetails, permission),
                FinalScore = FinalScore(resultDetails, permission),
                Sets = ScoreOfSets(resultDetails, resources, permission),
            };
        }

        private Score ScoreByResource(List<ResultDetail> resultDetails, string resource, Permission permission)
        {
            var resultDetail = resultDetails.FirstOrDefault(n => n.ResourceId == resource);

            var hasResult = resultDetail != null && resultDetail.MatchId > 0;

            return hasResult ? scoreSetService.GetScore(resultDetail, permission) : new Score("-");
        }

        private static Score TotalPoints(List<ResultDetail> resultDetails)
        {
            if (IsRefundMatch(resultDetails))
            {
                return new Score(SetStatus.Refund);
            }

            var games = resultDetails.Where(m => m.ResourceId.LongCount() == 4
                                && !string.IsNullOrWhiteSpace(m.HomeValue)
                                && !string.IsNullOrWhiteSpace(m.AwayValue)
                                && m.SettlementStatusId != SettlementStatus.Refund).ToList();

            if (games.Count > 0)
            {
                var home = games.Sum(m =>
                {
                    int.TryParse(m.HomeValue, out var homeValue);
                    return homeValue;
                });

                var away = games.Sum(m =>
                {
                    int.TryParse(m.AwayValue, out var awayValue);
                    return awayValue;
                });

                return new Score(home.ToString(), away.ToString());
            }
            else
            {
                return new Score("-");
            }
        }

        private static bool IsRefundMatch(List<ResultDetail> resultDetails)
        {
            return resultDetails.Count(m => m.ResourceId.Equals(Final) && m.SettlementStatusId == SettlementStatus.Refund) == 1;
        }
    }
}