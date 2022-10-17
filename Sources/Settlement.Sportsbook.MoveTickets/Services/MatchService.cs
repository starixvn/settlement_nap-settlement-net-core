using Settlement.Core.Models;
using Settlement.Core.Services;
using System.Collections.Generic;
using System.Linq;

namespace Settlement.Sportsbook.MoveTickets.Services
{
    public interface IMatchService
    {
        List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, int groupSport);

        List<Match> MergeMatches(List<Match> baseMatches, List<Match> siteMatches);

        List<Match> SetNewMatchInfo(List<Match> matches);
    }

    public class MatchServiceImp : IMatchService
    {
        private readonly IMatchResultDetailService matchResultDetailService;

        private readonly IRefDataService refDataService;

        private readonly CompareMatchService compareMatchService;

        private readonly NewInfoMatchService newInfoMatchService;

        public MatchServiceImp(
            IMatchResultDetailService matchResultDetailService,
            IRefDataService refDataService,
            CompareMatchService compareMatchService,
            NewInfoMatchService newInfoMatchService)
        {
            this.matchResultDetailService = matchResultDetailService;
            this.refDataService = refDataService;
            this.compareMatchService = compareMatchService;
            this.newInfoMatchService = newInfoMatchService;
        }

        public List<Match> GetScoreForMatchBySportType(List<Match> matches, List<ResultDetail> resultDetails, int sportType, int groupSport)
        {
            if (sportType == Core.Constants.SportType.Cricket)
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

        public List<Match> SetNewMatchInfo(List<Match> matches)
        {
            foreach (var match in matches)
            {
                newInfoMatchService.TicketInfo(match);
                match.NewEventStatus = newInfoMatchService.NewEventStatus(match);
                match.EventStatusColor = newInfoMatchService.EventStatusColor(match);
                match.EarlySettleStatus = newInfoMatchService.EarlySettlementStatus(match);
                match.RefDataService = refDataService;
            }

            return matches;
        }

        public List<Match> MergeMatches(List<Match> baseMatches, List<Match> siteMatches)
        {
            var peekNewMatches = siteMatches.Except(baseMatches).ToList();

            if (peekNewMatches.Any())
            {
                baseMatches.AddRange(peekNewMatches);
            }

            AddSiteInfo(baseMatches, siteMatches);

            return baseMatches;
        }

        private void AddSiteInfo(List<Match> baseMatches, List<Match> siteMatches)
        {
            foreach (var match in baseMatches)
            {
                var matchSiteInfo = compareMatchService.GetDifferentMatchSiteInfo(match, siteMatches);
                if (matchSiteInfo != null)
                {
                    match.SiteMatch.Add(matchSiteInfo);
                }
            }
        }
    }
}