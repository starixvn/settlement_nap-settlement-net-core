namespace Settlement.EventManagement.Services;

using Models;
using Settlement.EventManagement.Models.Calculation;
using MultiSportMatch = Models.MultiSports.Match;

public interface SiteMatchService
{
    bool IsExistMarkedTickets(BaseMatch match);

    bool IsExistRunningTickets(BaseMatch match);

    string GetBackgroundCompletedStatus(BaseMatch match);

    string GetOSBackgroundCompletedStatus(BaseMatch match);

    string FastMarketStatus(Match match);

    string EarlySettlementStatus(BaseMatch match);

    string EarlyOSSettlementStatus(BaseMatch match);

    bool IsExistFgLg(Match match);

    bool IsExistHtFgLg(Match match);

    bool IsExistsConfirmedEarly(MultiSportMatch match);

    bool IsExistsConfirmedOSEarly(MultiSportMatch match);

    int? IsCalculating(int? baseValue, List<int?> siteValues);

    int? IsCalculating(List<int?> siteValues);
}

public class SiteMatchServiceImp : SiteMatchService
{
    private const int MatchPen = 202;

    public bool IsExistMarkedTickets(BaseMatch match)
    {
        var isExistMarkedTicketOnSite = match.SiteMatch.Exists(m => m.IsExistMarkedTicket);
        return match.IsExistMarkedTicket || isExistMarkedTicketOnSite;
    }

    public bool IsExistRunningTickets(BaseMatch match)
    {
        var isExistRunningTicketOnSite = match.SiteMatch.Exists(m => m.IsExistRunningTicket);
        return match.IsExistRunningTicket || isExistRunningTicketOnSite;
    }

    public bool IsExistsConfirmedEarly(MultiSportMatch match)
    {
        var isExistsConfirmedEarly = match.SiteMatch.Exists(m => m.IsExistsConfirmedEarly);
        return match.IsExistsConfirmedEarly || isExistsConfirmedEarly;
    }

    public bool IsExistsConfirmedOSEarly(MultiSportMatch match)
    {
        return match.IsExistsConfirmedEarly;
    }

    public int? IsCalculating(int? baseValue, List<int?> siteValues)
    {
        if (baseValue == CalculateStatus.IsWaiting || siteValues.Exists(m => m == CalculateStatus.IsWaiting))
        {
            return CalculateStatus.IsWaiting;
        }

        if (baseValue == CalculateStatus.IsCalculating || siteValues.Exists(m => m == CalculateStatus.IsCalculating))
        {
            return CalculateStatus.IsCalculating;
        }

        if (baseValue == CalculateStatus.IsFailed || siteValues.Exists(m => m == CalculateStatus.IsFailed))
        {
            return CalculateStatus.IsFailed;
        }

        if (baseValue == CalculateStatus.IsSuccess && siteValues.TrueForAll(m => m == CalculateStatus.IsSuccess))
        {
            return CalculateStatus.IsSuccess;
        }

        return null;
    }

    public int? IsCalculating(List<int?> siteValues)
    {
        if (siteValues.Exists(m => m == CalculateStatus.IsWaiting))
        {
            return CalculateStatus.IsWaiting;
        }

        if (siteValues.Exists(m => m == CalculateStatus.IsCalculating))
        {
            return CalculateStatus.IsCalculating;
        }

        if (siteValues.Exists(m => m == CalculateStatus.IsFailed))
        {
            return CalculateStatus.IsFailed;
        }

        if (siteValues.TrueForAll(m => m == CalculateStatus.IsSuccess))
        {
            return CalculateStatus.IsSuccess;
        }

        return null;
    }

    public string GetBackgroundCompletedStatus(BaseMatch match)
    {
        return IsOnlyMarkedTicket(match)
            ? Background.WhiteBlinking
            : GetBackgroundRunningTicket(match);
    }

    public string GetOSBackgroundCompletedStatus(BaseMatch match)
    {
        return match.IsExistMarkedTicket && !match.IsExistRunningTicket
            ? Background.WhiteBlinking
            : GetOSBackgroundRunningTicket(match);
    }

    public string EarlySettlementStatus(BaseMatch match)
    {
        if (IsNotExistedEarlyBetTypes(match))
        {
            return match.ChildMatchType == MatchPen || match.IsOpenOdds ? TicketStatus.NoTicket : TicketStatus.Normal;
        }

        if (IsExistedRunningEarlyBetTypes(match))
        {
            return TicketStatus.Running;
        }

        if (IsExistedWaitingEarlyBetTypes(match))
        {
            return TicketStatus.Waiting;
        }

        return TicketStatus.Completed;
    }

    public string EarlyOSSettlementStatus(BaseMatch match)
    {
        if (!match.IsExistEarlyBetTypes)
        {
            return match.ChildMatchType == MatchPen || match.IsOpenOdds ? TicketStatus.NoTicket : TicketStatus.Normal;
        }

        if (match.IsRunningEarlyBetTypes)
        {
            return TicketStatus.Running;
        }

        if (match.IsWaitingEarlyBetTypes)
        {
            return TicketStatus.Waiting;
        }

        return TicketStatus.Completed;
    }

    private static bool IsExistedWaitingEarlyBetTypes(BaseMatch match)
    {
        return match.IsWaitingEarlyBetTypes || match.SiteMatch.Exists(m => m.IsWaitingEarlyBetTypes);
    }

    private static bool IsExistedRunningEarlyBetTypes(BaseMatch match)
    {
        return match.IsRunningEarlyBetTypes || match.SiteMatch.Exists(m => m.IsRunningEarlyBetTypes);
    }

    private static bool IsNotExistedEarlyBetTypes(BaseMatch match)
    {
        var matchSite = match.SiteMatch;
        var isExistEarlyBetTypes = match.IsExistEarlyBetTypes || matchSite.Exists(m => m.IsExistEarlyBetTypes);

        return !isExistEarlyBetTypes;
    }

    public string FastMarketStatus(Match match)
    {
        var matchSite = match.SiteMatch;
        var isExistFastMarket = match.IsExistFastMarket || matchSite.Exists(m => m.IsExistFastMarket);
        var isRunningFastMarket = match.IsRunningFastMarket || matchSite.Exists(m => m.IsRunningFastMarket);
        var isExistFastMarketResult = match.IsExistFastMarketResult || matchSite.Exists(m => m.IsExistFastMarketResult);
        if (!isExistFastMarket)
        {
            return isExistFastMarketResult ? TicketStatus.NoTicket : TicketStatus.Normal;
        }

        return isRunningFastMarket ? TicketStatus.Running : TicketStatus.Completed;
    }

    private string GetBackgroundRunningTicket(BaseMatch match)
    {
        if (IsExistMarkedTickets(match))
        {
            return Background.PinkBlinking;
        }

        return IsExistRunningTickets(match) ? Background.Pink : string.Empty;
    }

    private string GetOSBackgroundRunningTicket(BaseMatch match)
    {
        if (match.IsExistMarkedTicket)
        {
            return Background.PinkBlinking;
        }

        return match.IsExistRunningTicket ? Background.Pink : string.Empty;
    }

    private bool IsOnlyMarkedTicket(BaseMatch match)
    {
        return IsExistMarkedTickets(match) && !IsExistRunningTickets(match);
    }

    public bool IsExistFgLg(Match match)
    {
        var isExistFgLgOnSite = match.SiteMatch.Exists(m => m.IsExistFgLg);
        return match.IsExistFgLg || isExistFgLgOnSite;
    }

    public bool IsExistHtFgLg(Match match)
    {
        var isExistHtFgLgOnSite = match.SiteMatch.Exists(m => m.IsExistHtFgLg);
        return match.IsExistHtFgLg || isExistHtFgLgOnSite;
    }
}