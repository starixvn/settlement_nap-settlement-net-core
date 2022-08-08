using System.Collections.Generic;
using System.Linq;
using Match = Settlement.EventManagement.Models.MultiSports.Match;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;

namespace Settlement.EventManagement.Services.SpecificService.Tennis
{
    public interface ITennisService
    {
        MoreScores ScoreLoader(Match match, List<ResultDetail> resultDetails, Permission permission);
    }

    public class TennisServiceImp : ITennisService
    {
        private readonly IScoreService scoreService;

        private readonly IScoreSetService scoreSetService;

        private readonly List<string> setResource = new List<string> { "01", "02", "03", "04", "05" };

        public TennisServiceImp(
            IScoreSetService scoreSetService,
            IScoreService scoreService)
        {
            this.scoreSetService = scoreSetService;
            this.scoreService = scoreService;
        }

        public MoreScores ScoreLoader(Match match, List<ResultDetail> resultDetails, Permission permission)
        {
            var moreScore = new MoreScores();
            moreScore.Sets = setResource.Select(x => new Score("-")).ToArray();
            moreScore.HalfTimeScore = new Score("-");
            moreScore.FinalScore = new Score("-");
            var home = 0;
            var away = 0;
            var items = resultDetails.OrderBy(n => n.ResourceId).ToList();

            foreach (var item in items)
            {
                if (setResource.Contains(item.ResourceId))
                {
                    var scoreSet = scoreSetService.GetScore(item, permission);
                    moreScore.Sets[int.Parse(item.ResourceId) - 1] = scoreSet;

                    var totalGames = scoreService.ScoreSet(item);

                    home += int.Parse(totalGames.Home);
                    away += int.Parse(totalGames.Away);
                }
            }

            var totalGame = new Score(home.ToString(), away.ToString());
            var totalSet = items.FirstOrDefault(n => n.ResourceId == ResourceType.Final);

            match.EventStatus = GetEventStatus(totalSet, match.EventStatus);

            if (totalSet != null && totalSet.MatchId > 0)
            {
                moreScore.FinalScore = scoreSetService.GetScore(totalSet, permission);
                moreScore.HalfTimeScore = scoreService.TotalGame(moreScore.FinalScore.Home, totalGame);
            }

            return moreScore;
        }

        private string GetEventStatus(ResultDetail totalSet, string currentStatus)
        {
            return totalSet != null && scoreService.IsRefundMatch(totalSet.HomeValue) ? "Refund" : currentStatus;
        }
    }
}