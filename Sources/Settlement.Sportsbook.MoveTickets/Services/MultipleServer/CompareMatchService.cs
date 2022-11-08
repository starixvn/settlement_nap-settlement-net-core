using Settlement.Core.Models;

namespace Settlement.Sportsbook.MoveTickets.Services
{
    public interface CompareMatchService
    {
        SiteMatch GetDifferentMatchSiteInfo(Match match, List<Match> siteMatches);
    }

    public class CompareMatchServiceImp : CompareMatchService
    {
        public SiteMatch GetDifferentMatchSiteInfo(Match match, List<Match> siteMatches)
        {
            var siteMatch = siteMatches.FirstOrDefault(m => m.MatchId == match.MatchId);
            if (siteMatch != null && (IsChangedOnTicket(match, siteMatch) || IsChangeOnSpecialBetType(match, siteMatch)))
            {
                return new SiteMatch
                {
                    IsCalculatingSingle = siteMatch.IsCalculatingSingle,
                    IsExistMarkedTicket = siteMatch.IsExistMarkedTicket,
                    IsExistRunningTicket = siteMatch.IsExistRunningTicket,
                    IsExistEarlyBetTypes = siteMatch.IsExistEarlyBetTypes,
                    IsRunningEarlyBetTypes = siteMatch.IsRunningEarlyBetTypes,
                    IsWaitingEarlyBetTypes = siteMatch.IsWaitingEarlyBetTypes,
                    IsExistMarkedTicketParlay = siteMatch.IsExistMarkedTicketParlay,
                    IsExistRunningTicketParlay = siteMatch.IsExistRunningTicketParlay,
                    IsExistEarlyBettypesParlay = siteMatch.IsExistEarlyBettypesParlay,
                    IsRunningEarlyBettypesParlay = siteMatch.IsRunningEarlyBettypesParlay,
                    IsWaitingEarlyBettypesParlay = siteMatch.IsWaitingEarlyBettypesParlay,
                };
            }

            return null;
        }

        private static bool IsChangedOnTicket(Match match, Match siteMatch)
        {
            var isExistRunning = match.IsExistRunningTicket != siteMatch.IsExistRunningTicket
                            || match.IsExistRunningTicketParlay != siteMatch.IsExistRunningTicketParlay;

            var isExistMarked = match.IsExistMarkedTicket != siteMatch.IsExistMarkedTicket
                        || match.IsExistMarkedTicketParlay != siteMatch.IsExistMarkedTicketParlay;

            return match.IsCalculatingSingle != siteMatch.IsCalculatingSingle
                || isExistMarked
                || isExistRunning;
        }

        private static bool IsChangeOnSpecialBetType(Match match, Match siteMatch)
        {
            var isExistEarly = match.IsExistEarlyBetTypes != siteMatch.IsExistEarlyBetTypes
                                || match.IsRunningEarlyBetTypes != siteMatch.IsRunningEarlyBetTypes
                                || match.IsWaitingEarlyBetTypes != siteMatch.IsWaitingEarlyBetTypes;
            var isExistParlay = match.IsExistEarlyBettypesParlay != siteMatch.IsExistEarlyBettypesParlay
                               || match.IsRunningEarlyBettypesParlay != siteMatch.IsRunningEarlyBettypesParlay
                               || match.IsWaitingEarlyBettypesParlay != siteMatch.IsWaitingEarlyBettypesParlay;

            return isExistEarly || isExistParlay;
        }
    }
}