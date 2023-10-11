namespace Settlement.EventManagement.Services.Calculation;

using Settlement.Core.Models;
using CalculationMatch = Models.Calculation.Match;

public interface CompareMatchService
{
    SiteMatch GetDifferentMatchSiteInfo(CalculationMatch match, List<CalculationMatch> siteMatches);
}

public class CompareMatchServiceImp : CompareMatchService
{
    public SiteMatch GetDifferentMatchSiteInfo(CalculationMatch match, List<CalculationMatch> siteMatches)
    {
        var siteMatch = siteMatches.Find(m => m.MatchId == match.MatchId);
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
                IsRunningFastMarket = siteMatch.IsRunningFastMarket,
                IsExistFgLg = siteMatch.IsExistFgLg,
                IsExistHtFgLg = siteMatch.IsExistHtFgLg
            };
        }

        return null;
    }

    private static bool IsChangedOnTicket(CalculationMatch match, CalculationMatch siteMatch)
    {
        var isExistRunning = match.IsExistRunningTicket != siteMatch.IsExistRunningTicket;

        var isExistMarked = match.IsExistMarkedTicket != siteMatch.IsExistMarkedTicket;

        var isChangedTicket = match.IsExistFgLg != siteMatch.IsExistFgLg ||
                              match.IsExistHtFgLg != siteMatch.IsExistHtFgLg;

        return match.IsCalculatingSingle != siteMatch.IsCalculatingSingle
            || isExistMarked
            || isExistRunning
            || isChangedTicket;
    }

    private static bool IsChangeOnSpecialBetType(CalculationMatch match, CalculationMatch siteMatch)
    {
        var isExistParlay = match.IsExistEarlyBetTypes != siteMatch.IsExistEarlyBetTypes
                            || match.IsRunningEarlyBetTypes != siteMatch.IsRunningEarlyBetTypes
                            || match.IsWaitingEarlyBetTypes != siteMatch.IsWaitingEarlyBetTypes;

        var isExistFastMarket = match.IsExistFastMarket != siteMatch.IsExistFastMarket
                                || match.IsExistFastMarketResult != siteMatch.IsExistFastMarketResult
                                || match.IsRunningFastMarket != siteMatch.IsRunningFastMarket;

        return isExistParlay || isExistFastMarket;
    }
}