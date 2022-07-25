using Settlement.Core.Models;
using System.Collections.Generic;
using System.Linq;
using CalculationMatch = Settlement.EventManagement.Models.Calculation.Match;

namespace Settlement.EventManagement.Services.Calculation
{
    public interface CompareMatchService
    {
        SiteMatch GetDifferentMatchSiteInfo(CalculationMatch match, List<CalculationMatch> siteMatches);
    }

    public class CompareMatchServiceImp : CompareMatchService
    {
        public SiteMatch GetDifferentMatchSiteInfo(CalculationMatch match, List<CalculationMatch> siteMatches)
        {
            var siteMatch = siteMatches.FirstOrDefault(m => m.MatchId == match.MatchId);
            if (siteMatch != null && (IsChangedValue(match, siteMatch) || IsExistSpecialBetType(match, siteMatch)))
            {
                return new SiteMatch
                {
                    IsCalculatingSingle = siteMatch.IsCalculatingSingle
                };
            }

            return null;
        }

        private static bool IsChangedValue(CalculationMatch match, CalculationMatch siteMatch)
        {
            var isExistRunning = match.IsExistRunningTicket != siteMatch.IsExistRunningTicket
                                 || match.IsExistRunningTicketParlay != siteMatch.IsExistRunningTicketParlay;

            var isExistMarked = match.IsExistMarkedTicket != siteMatch.IsExistMarkedTicket
                                || match.IsExistMarkedTicketParlay != siteMatch.IsExistMarkedTicketParlay;

            return match.IsCalculatingSingle != siteMatch.IsCalculatingSingle
                || isExistMarked
                || isExistRunning;
        }

        private static bool IsExistSpecialBetType(CalculationMatch match, CalculationMatch siteMatch)
        {
            var isExistParlay = match.IsExistEarlyBetTypes != siteMatch.IsExistEarlyBetTypes
                                || match.IsExistRunningTicketParlay != siteMatch.IsExistRunningTicketParlay
                                || match.IsRunningEarlyBetTypes != siteMatch.IsRunningEarlyBetTypes
                                || match.IsWaitingEarlyBetTypes != siteMatch.IsWaitingEarlyBetTypes;

            var isExistFastMarket = match.IsExistFastMarket != siteMatch.IsExistMarkedTicket
                                    || match.IsExistFastMarketResult != siteMatch.IsExistFastMarketResult
                                    || match.IsRunningFastMarket != siteMatch.IsRunningFastMarket;
            return isExistParlay || isExistFastMarket;
        }
    }
}