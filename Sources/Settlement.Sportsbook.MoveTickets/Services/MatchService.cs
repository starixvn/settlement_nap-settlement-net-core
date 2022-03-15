using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using System.Collections.Generic;

namespace Settlement.Sportsbook.MoveTickets.Services
{
    public interface IMatchService
    {
        List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, int groupSport);
    }

    public class MatchServiceImp : IMatchService
    {
        private readonly IMatchResultDetailService matchResultDetailService;

        private readonly IRefDataService refDataService;

        public MatchServiceImp(
            IMatchResultDetailService matchResultDetailService,
            IRefDataService refDataService)
        {
            this.matchResultDetailService = matchResultDetailService;
            this.refDataService = refDataService;
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