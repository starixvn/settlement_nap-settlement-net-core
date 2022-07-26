using System.Collections.Generic;
using System.Linq;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Models.Calculation;
using Match = Settlement.EventManagement.Models.Calculation.Match;

namespace Settlement.EventManagement.Services.Calculation
{
    public interface LeagueService
    {
        List<League> League(List<Match> sports);
    }

    public class LeagueServiceImp : LeagueService
    {
        public List<League> League(List<Match> matches)
        {
            var currentLeague = 0;
            var leagues = new List<League>();
            var league = new League();
            //foreach (var match in matches)
            //{
            //    if (!currentLeague.Equals(match.LeagueId))
            //    {
            //        league = new League
            //        {
            //            Name = sport.LeagueName,
            //            LeagueId = sport.LeagueId,
            //            Matches = new List<MultiSportMatch>(),
            //        };

            //        currentLeague = sport.LeagueId;
            //        league.Matches.Add(sport);
            //        leagues.Add(league);
            //    }
            //    else
            //    {
            //        league.Matches.Add(sport);
            //    }
            //}

            return leagues.ToList();
        }
    }
}
