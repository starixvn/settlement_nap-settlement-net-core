using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Fanex.Data.Repository;
using Settlement.EventManagement.Criteria;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Models.Calculation;
using Settlement.EventManagement.Requests;
using Match = Settlement.EventManagement.Models.Calculation.Match;

namespace Settlement.EventManagement.Services.Calculation
{
    public interface LeagueService
    {
        Task<List<LeagueTypeModel>> Leagues(LeagueCalculationRequest request);

        List<League> Leagues(List<Match> matches);
    }

    public class LeagueServiceImp : LeagueService
    {
        private readonly IDynamicRepository repository;
        private readonly IMapper mapper;

        public LeagueServiceImp(IDynamicRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<List<LeagueTypeModel>> Leagues(LeagueCalculationRequest request)
        {
            var criteria = mapper.Map<LeagueCalculationRequest, LeagueCalculationCriteria>(request);
            return (await repository.FetchAsync<LeagueTypeModel>(criteria)).ToList();
        }

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
