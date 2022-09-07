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
            var isRunningEarlyBetTypesParlay = IsExistedRunningEarlyBetTypesParlay(match);
            var isWaitingEarlyBetTypesParlay = IsExistedWaitingEarlyBetTypesParlay(match);

            if (IsNotExistedEarlyBetTypes(match))
            {
                return match.ChildMatchType == MatchPen || match.IsOpenOdds ? TicketStatus.NoTicket : TicketStatus.Normal;
            }

            if (IsExistedRunningEarlyBetTypes(match) || (match.IsMergedParlay && isRunningEarlyBetTypesParlay))
            {
                return TicketStatus.Running;
            }

            if (IsExistedWaitingEarlyBetTypes(match) || (match.IsMergedParlay && isWaitingEarlyBetTypesParlay))
            {
                return TicketStatus.Waiting;
            }

            return EarlyParlayStatus(isRunningEarlyBetTypesParlay, isWaitingEarlyBetTypesParlay);
        }

        private static bool IsExistedWaitingEarlyBetTypesParlay(BaseMatch match)
        {
            return match.IsWaitingEarlyBettypesParlay || match.SiteMatch.Exists(m => m.IsWaitingEarlyBettypesParlay);
        }

        private static bool IsExistedRunningEarlyBetTypesParlay(BaseMatch match)
        {
            return match.IsRunningEarlyBettypesParlay || match.SiteMatch.Exists(m => m.IsRunningEarlyBettypesParlay);
        }

        private static bool IsExistedWaitingEarlyBetTypes(BaseMatch match)
        {
            return match.IsWaitingEarlyBetTypes || match.SiteMatch.Exists(m => m.IsWaitingEarlyBetTypes);
        }

        private static bool IsExistedRunningEarlyBetTypes(BaseMatch match)
        {
           return match.IsRunningEarlyBetTypes || match.SiteMatch.Exists(m => m.IsRunningEarlyBetTypes);
        }

        private static string EarlyParlayStatus(bool isRunningEarlyBetTypesParlay, bool isWaitingEarlyBetTypesParlay)
        {
            if (isRunningEarlyBetTypesParlay)
            {
                return TicketStatus.ParlayRunning;
            }

            return isWaitingEarlyBetTypesParlay ? TicketStatus.ParlayWaiting : TicketStatus.Completed;
        }

        private static bool IsNotExistedEarlyBetTypes(BaseMatch match)
        {
            var matchSite = match.SiteMatch;
            var isExistEarlyBetTypes = match.IsExistEarlyBetTypes || matchSite.Exists(m => m.IsExistEarlyBetTypes);
            var isExistEarlyBetTypesParlay = match.IsExistEarlyBettypesParlay || matchSite.Exists(m => m.IsExistEarlyBettypesParlay);

            return !isExistEarlyBetTypes && !isExistEarlyBetTypesParlay;
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
}