namespace Settlement.Sportsbook.MoveTickets.Services.MultipleServer;

using Constants;
using Settlement.Models;

public interface SiteMatchService
{
    string GetBackgroundCompletedStatus(Match match);

    string EarlySettlementStatus(Match match);

    int? IsCalculatingSingle(Match match);

    int? IsCalculatingSingle(List<SiteMatch> siteMatches);
}

public class SiteMatchServiceImp : SiteMatchService
{
    private const int MatchPen = 202;

    public int? IsCalculatingSingle(Match match)
    {
        if (match.IsCalculatingSingle == CalculateStatus.IsWaiting || match.SiteMatch.Exists(m => m.IsCalculatingSingle == CalculateStatus.IsWaiting))
        {
            return CalculateStatus.IsWaiting;
        }

        if (match.IsCalculatingSingle == CalculateStatus.IsCalculating || match.SiteMatch.Exists(m => m.IsCalculatingSingle == CalculateStatus.IsCalculating))
        {
            return CalculateStatus.IsCalculating;
        }

        if (match.IsCalculatingSingle == CalculateStatus.IsFailed || match.SiteMatch.Exists(m => m.IsCalculatingSingle == CalculateStatus.IsFailed))
        {
            return CalculateStatus.IsFailed;
        }

        if (match.IsCalculatingSingle == CalculateStatus.IsSuccess && match.SiteMatch.TrueForAll(m => m.IsCalculatingSingle == CalculateStatus.IsSuccess))
        {
            return CalculateStatus.IsSuccess;
        }

        return null;
    }

    public int? IsCalculatingSingle(List<SiteMatch> siteMatches)
    {
        if (siteMatches.Exists(m => m.IsCalculatingSingle == CalculateStatus.IsWaiting))
        {
            return CalculateStatus.IsWaiting;
        }

        if (siteMatches.Exists(m => m.IsCalculatingSingle == CalculateStatus.IsCalculating))
        {
            return CalculateStatus.IsCalculating;
        }

        if (siteMatches.Exists(m => m.IsCalculatingSingle == CalculateStatus.IsFailed))
        {
            return CalculateStatus.IsFailed;
        }

        if (siteMatches.TrueForAll(m => m.IsCalculatingSingle == CalculateStatus.IsSuccess))
        {
            return CalculateStatus.IsSuccess;
        }

        return null;
    }

    public string GetBackgroundCompletedStatus(Match match)
    {
        return IsOnlyMarkedTicket(match)
            ? Background.WhiteBlinking
            : GetBackgroundRunningTicket(match);
    }

    public string EarlySettlementStatus(Match match)
    {
        if (IsNotExistedEarlyBetTypes(match))
        {
            return match.ChildMatchType == MatchPen || match.IsOpenOdds ? TicketStatus.NoTicket : TicketStatus.Normal;
        }

        if (IsExistedRunningEarlyBetTypes(match))
        {
            return TicketStatus.Running;
        }

        return IsExistedWaitingEarlyBetTypes(match) ? TicketStatus.Waiting : TicketStatus.Completed;
    }

    private static bool IsExistedWaitingEarlyBetTypes(Match match) => match.IsWaitingEarlyBetTypes;

    private static bool IsExistedRunningEarlyBetTypes(Match match) => match.IsRunningEarlyBetTypes;

    private static bool IsNotExistedEarlyBetTypes(Match match) => !match.IsExistEarlyBetTypes;

    private string GetBackgroundRunningTicket(Match match)
    {
        if (match.IsExistMarkedTicket)
        {
            return Background.PinkBlinking;
        }

        return match.IsExistRunningTicket ? Background.Pink : string.Empty;
    }

    private bool IsOnlyMarkedTicket(Match match)
    {
        return match.IsExistMarkedTicket && !match.IsExistRunningTicket;
    }
}