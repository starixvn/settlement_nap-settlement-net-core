using Fanex.Caching;
using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Criterias;
using Settlement.Sportsbook.MoveTickets.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace Settlement.Sportsbook.MoveTickets.Services
{
    public interface IMatchService
    {
        MultiSportResult GetMatchesAndResultDetails(ICriteria criteria);

        List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, int groupSport);
    }

    public class MatchService : IMatchService
    {

        private readonly IDynamicRepository repository;

        private readonly IMatchResultDetailService matchResultDetailService;

        private readonly IRefDataService refDataService;

        public MatchService(
            IDynamicRepository repository,
            IMatchResultDetailService matchResultDetailService,
            IRefDataService refDataService)
        {
            this.repository = repository;
            this.matchResultDetailService = matchResultDetailService;
            this.refDataService = refDataService;
        }

        public MultiSportResult GetMatchesAndResultDetails(ICriteria criteria)
        {
            var result = repository.FetchMultiple<Match, ResultDetail>(criteria);

            return new MultiSportResult
            {
                Matches = result.Item1.ToList(),
                ResultDetails = result.Item2.ToList()
            };
        }

        public List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, int groupSport)
        {
            if (sportType == SportType.Cricket)
            {
                return matchResultDetailService.CricketResultDetail(matches, resultDetails);
            }

            foreach (var result in matches)
            {
                result.RefDataService = refDataService;
                result.GroupSport = groupSport;
            }

            return matches;
        }
    }
}