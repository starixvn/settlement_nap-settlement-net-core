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
                    IsExistFastMarket = siteMatch.IsExistFastMarket,
                    IsExistFastMarketResult = siteMatch.IsExistFastMarketResult,
                    IsRunningFastMarket = siteMatch.IsRunningFastMarket
                };
            }

            return null;
        }

        private static bool IsChangedOnTicket(CalculationMatch match, CalculationMatch siteMatch)
        {
            var isExistRunning = match.IsExistRunningTicket != siteMatch.IsExistRunningTicket;

            var isExistMarked = match.IsExistMarkedTicket != siteMatch.IsExistMarkedTicket;

            return match.IsCalculatingSingle != siteMatch.IsCalculatingSingle
                || isExistMarked
                || isExistRunning;
        }

        private static bool IsChangeOnSpecialBetType(CalculationMatch match, CalculationMatch siteMatch)
        {
            var isExistParlay = match.IsExistEarlyBetTypes != siteMatch.IsExistEarlyBetTypes
                                || match.IsRunningEarlyBetTypes != siteMatch.IsRunningEarlyBetTypes
                                || match.IsWaitingEarlyBetTypes != siteMatch.IsWaitingEarlyBetTypes;

            var isExistFastMarket = match.IsExistFastMarket != siteMatch.IsExistMarkedTicket
                                    || match.IsExistFastMarketResult != siteMatch.IsExistFastMarketResult
                                    || match.IsRunningFastMarket != siteMatch.IsRunningFastMarket;

            return isExistParlay || isExistFastMarket;
        }
    }
}