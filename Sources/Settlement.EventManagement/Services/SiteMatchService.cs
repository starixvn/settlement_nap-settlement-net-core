using Settlement.Core.Constants;
using Settlement.EventManagement.Models.Calculation;
using System.Linq;
using Settlement.EventManagement.Models;
using MultiSportMatch = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.Services
{
    public interface SiteMatchService
    {
        bool IsExistMarkedTickets(BaseMatch match);

        bool IsExistRunningTickets(BaseMatch match);

        string GetBackgroundCompletedStatus(BaseMatch match);

        string FastMarketStatus(Match match);

        string EarlySettlementStatus(BaseMatch match);

        bool IsExistFgLg(Match match);

        bool IsExistHtFgLg(Match match);

        bool IsExistMarkedTicketParlay(BaseMatch match);

        bool IsExistRunningTicketParlay(BaseMatch match);

        bool IsExistMarkedTicketsSingle(BaseMatch match);

        bool IsExistsConfirmedEarly(MultiSportMatch match);

        int? IsCalculatingSingle(BaseMatch match);
    }

    public class SiteMatchServiceImp : SiteMatchService
    {
        private const int MatchPen = 202;

        public bool IsExistMarkedTicketsSingle(BaseMatch match)
        {
            var isExistMarkedTicketOnSite = match.SiteMatch.Exists(m => m.IsExistMarkedTicket);
            return match.IsExistMarkedTicket || isExistMarkedTicketOnSite;
        }

        public bool IsExistMarkedTickets(BaseMatch match)
        {
            var isExistMarkedTicketOnSite = match.SiteMatch.Exists(m => m.IsExistMarkedTicket);
            return IsExistMarkedTicketParlay(match) || match.IsExistMarkedTicket || isExistMarkedTicketOnSite;
        }

        public bool IsExistRunningTickets(BaseMatch match)
        {
            var isExistRunningTicketOnSite = match.SiteMatch.Exists(m => m.IsExistRunningTicket);
            return match.IsExistRunningTicket || isExistRunningTicketOnSite;
        }

        public bool IsExistMarkedTicketParlay(BaseMatch match)
        {
            var isExistMarkedTicketParlay = match.SiteMatch.Exists(m => m.IsExistMarkedTicketParlay);
            return match.IsExistMarkedTicketParlay || isExistMarkedTicketParlay;
        }

        public bool IsExistRunningTicketParlay(BaseMatch match)
        {
            var isExistRunningTicketParlay = match.SiteMatch.Exists(m => m.IsExistRunningTicketParlay);
            return match.IsExistMarkedTicketParlay || isExistRunningTicketParlay;
        }

        public bool IsExistsConfirmedEarly(MultiSportMatch match)
        {
            var isExistsConfirmedEarly = match.SiteMatch.Exists(m => m.IsExistsConfirmedEarly);
            return match.IsExistsConfirmedEarly || isExistsConfirmedEarly;
        }

        public int? IsCalculatingSingle(BaseMatch match)
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

            if (match.IsCalculatingSingle == CalculateStatus.IsSuccess && match.SiteMatch.All(m => m.IsCalculatingSingle == CalculateStatus.IsSuccess))
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

        public string EarlySettlementStatus(BaseMatch match)
        {
            var matchSite = match.SiteMatch;
            var isExistEarlyBetTypes = match.IsExistEarlyBetTypes || matchSite.Exists(m => m.IsExistEarlyBetTypes);
            var isRunningEarlyBetTypes = match.IsRunningEarlyBetTypes || matchSite.Exists(m => m.IsRunningEarlyBetTypes);
            var isWaitingEarlyBetTypes = match.IsWaitingEarlyBetTypes || matchSite.Exists(m => m.IsWaitingEarlyBetTypes);
            var isExistEarlyBettypesParlay = match.IsExistEarlyBettypesParlay || matchSite.Exists(m => m.IsExistEarlyBettypesParlay);
            var isRunningEarlyBettypesParlay = match.IsRunningEarlyBettypesParlay || matchSite.Exists(m => m.IsRunningEarlyBettypesParlay);
            var isWaitingEarlyBettypesParlay = match.IsWaitingEarlyBettypesParlay || matchSite.Exists(m => m.IsWaitingEarlyBettypesParlay);
            if (!isExistEarlyBetTypes && !isExistEarlyBettypesParlay)
            {
                return match.ChildMatchType == MatchPen || match.IsOpenOdds ? "No Ticket" : "N/A";
            }

            if (isRunningEarlyBetTypes || (match.IsMergedParlay && isRunningEarlyBettypesParlay))
            {
                return "Running";
            }

            if (isWaitingEarlyBetTypes || (match.IsMergedParlay && isWaitingEarlyBettypesParlay))
            {
                return "Waiting";
            }

            if (isRunningEarlyBettypesParlay)
            {
                return "Parlay Running";
            }

            if (isWaitingEarlyBettypesParlay)
            {
                return "Parlay Waiting";
            }

            return "Completed";
        }

        public string FastMarketStatus(Match match)
        {
            var matchSite = match.SiteMatch;
            var isExistFastMarket = match.IsExistFastMarket || matchSite.Exists(m => m.IsExistFastMarket);
            var isRunningFastMarket = match.IsRunningFastMarket || matchSite.Exists(m => m.IsRunningFastMarket);
            var isExistFastMarketResult = match.IsExistFastMarketResult || matchSite.Exists(m => m.IsExistFastMarketResult);
            if (!isExistFastMarket)
            {
                return isExistFastMarketResult ? "No Ticket" : "N/A";
            }

            if (isRunningFastMarket)
            {
                return "Running";
            }

            return "Completed";
        }

        private string GetBackgroundRunningTicket(BaseMatch match)
        {
            if (IsExistMarkedTickets(match))
            {
                return Background.PinkBlinking;
            }

            return IsExistRunningTicket(match) ? Background.Pink : string.Empty;
        }

        private bool IsOnlyMarkedTicket(BaseMatch match)
        {
            return IsExistMarkedTickets(match) && !IsExistRunningTicket(match);
        }

        private bool IsExistRunningTicket(BaseMatch match)
        {
            var isExistRunningTicketOnSite = match.SiteMatch.Exists(m => m.IsExistRunningTicket);
            return match.IsExistRunningTicket || isExistRunningTicketOnSite;
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
}