using System.Collections.Generic;
using System.Linq;
using Settlement.EventManagement.Models.Calculation;
using Match = Settlement.EventManagement.Models.Calculation.Match;

namespace Settlement.EventManagement.Services.Calculation
{
    public interface LeagueService
    {
        List<League> Leagues(List<Match> matches);
    }

    public class LeagueServiceImp : LeagueService
    {
        public List<League> Leagues(List<Match> matches)
        {
            var currentLeague = 0;
            var leagues = new List<League>();
            var league = new League();
            foreach (var match in matches)
            {
                if (currentLeague.Equals(match.LeagueId))
                {
                    league.Matches.Add(match);
                }
                else
                {
                    league = new League
                    {
                        Name = match.LeagueName,
                        LeagueId = match.LeagueId,
                    };

                    league.Matches.Add(match);
                    leagues.Add(league);
                    currentLeague = match.LeagueId;
                }
            }

            return leagues.ToList();
        }
    }
}
