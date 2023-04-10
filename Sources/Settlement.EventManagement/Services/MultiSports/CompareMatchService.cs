namespace Settlement.EventManagement.Services.MultiSports;

using Settlement.Core.Models;
using MultiSportMatch = Settlement.EventManagement.Models.MultiSports.Match;

public interface CompareMatchService
{
    SiteMatch GetDifferentMatchSiteInfo(MultiSportMatch match, List<MultiSportMatch> siteMatches);
}

public class CompareMatchServiceImp : CompareMatchService
{
    public SiteMatch GetDifferentMatchSiteInfo(MultiSportMatch match, List<MultiSportMatch> siteMatches)
    {
        var siteMatch = siteMatches.FirstOrDefault(m => m.MatchId == match.MatchId);
        if (siteMatch != null && (IsChangedOnTicket(match, siteMatch) || IsChangeOnSpecialBetType(match, siteMatch)))
        {
            return new SiteMatch
            {
                IsCalculatingSingle = siteMatch.IsCalculatingSingle,
                IsCalculatingMP = siteMatch.IsCalculatingMP,
                IsExistMarkedTicket = siteMatch.IsExistMarkedTicket,
                IsExistRunningTicket = siteMatch.IsExistRunningTicket,
                IsExistEarlyBetTypes = siteMatch.IsExistEarlyBetTypes,
                IsRunningEarlyBetTypes = siteMatch.IsRunningEarlyBetTypes,
                IsWaitingEarlyBetTypes = siteMatch.IsWaitingEarlyBetTypes,
                IsExistsConfirmedEarly = siteMatch.IsExistsConfirmedEarly,
            };
        }

        return null;
    }

    private static bool IsChangedOnTicket(MultiSportMatch match, MultiSportMatch siteMatch)
    {
        var isExistRunning = match.IsExistRunningTicket != siteMatch.IsExistRunningTicket;

        var isExistMarked = match.IsExistMarkedTicket != siteMatch.IsExistMarkedTicket;

        return match.IsCalculatingSingle != siteMatch.IsCalculatingSingle ||
               match.IsCalculatingMP != siteMatch.IsCalculatingMP
               || isExistMarked
               || isExistRunning;
    }

    private static bool IsChangeOnSpecialBetType(MultiSportMatch match, MultiSportMatch siteMatch)
    {
        return match.IsExistEarlyBetTypes != siteMatch.IsExistEarlyBetTypes
               || match.IsRunningEarlyBetTypes != siteMatch.IsRunningEarlyBetTypes
               || match.IsWaitingEarlyBetTypes != siteMatch.IsWaitingEarlyBetTypes;
    }
}