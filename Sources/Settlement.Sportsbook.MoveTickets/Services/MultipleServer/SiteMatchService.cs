using Settlement.Core.Constants;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.MoveTickets.Services
{
    public interface SiteMatchService
    {
        bool IsExistMarkedTickets(Match match);

        bool IsExistRunningTickets(Match match);

        string GetBackgroundCompletedStatus(Match match);

        string EarlySettlementStatus(Match match);

        bool IsExistMarkedTicketParlay(Match match);

        bool IsExistRunningTicketParlay(Match match);

        bool IsExistMarkedTicketsSingle(Match match);

        int? IsCalculatingSingle(Match match);
    }

    public class SiteMatchServiceImp : SiteMatchService
    {
        private const int MatchPen = 202;

        public bool IsExistMarkedTicketsSingle(Match match)
        {
            var isExistMarkedTicketOnSite = match.SiteMatch.Exists(m => m.IsExistMarkedTicket);
            return match.IsExistMarkedTicket || isExistMarkedTicketOnSite;
        }

        public bool IsExistMarkedTickets(Match match)
        {
            var isExistMarkedTicketOnSite = match.SiteMatch.Exists(m => m.IsExistMarkedTicket);
            return IsExistMarkedTicketParlay(match) || match.IsExistMarkedTicket || isExistMarkedTicketOnSite;
        }

        public bool IsExistRunningTickets(Match match)
        {
            var isExistRunningTicketOnSite = match.SiteMatch.Exists(m => m.IsExistRunningTicket);
            return match.IsExistRunningTicket || isExistRunningTicketOnSite;
        }

        public bool IsExistMarkedTicketParlay(Match match)
        {
            var isExistMarkedTicketParlay = match.SiteMatch.Exists(m => m.IsExistMarkedTicketParlay);
            return match.IsExistMarkedTicketParlay || isExistMarkedTicketParlay;
        }

        public bool IsExistRunningTicketParlay(Match match)
        {
            var isExistRunningTicketParlay = match.SiteMatch.Exists(m => m.IsExistRunningTicketParlay);
            return match.IsExistRunningTicketParlay || isExistRunningTicketParlay;
        }

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

            if (match.IsCalculatingSingle == CalculateStatus.IsSuccess && match.SiteMatch.All(m => m.IsCalculatingSingle == CalculateStatus.IsSuccess))
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

        private static bool IsExistedWaitingEarlyBetTypesParlay(Match match)
        {
            return match.IsWaitingEarlyBettypesParlay || match.SiteMatch.Exists(m => m.IsWaitingEarlyBettypesParlay);
        }

        private static bool IsExistedRunningEarlyBetTypesParlay(Match match)
        {
            return match.IsRunningEarlyBettypesParlay || match.SiteMatch.Exists(m => m.IsRunningEarlyBettypesParlay);
        }

        private static bool IsExistedWaitingEarlyBetTypes(Match match)
        {
            return match.IsWaitingEarlyBetTypes || match.SiteMatch.Exists(m => m.IsWaitingEarlyBetTypes);
        }

        private static bool IsExistedRunningEarlyBetTypes(Match match)
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

        private static bool IsNotExistedEarlyBetTypes(Match match)
        {
            var matchSite = match.SiteMatch;
            var isExistEarlyBetTypes = match.IsExistEarlyBetTypes || matchSite.Exists(m => m.IsExistEarlyBetTypes);
            var isExistEarlyBetTypesParlay = match.IsExistEarlyBettypesParlay || matchSite.Exists(m => m.IsExistEarlyBettypesParlay);

            return !isExistEarlyBetTypes && !isExistEarlyBetTypesParlay;
        }

        private string GetBackgroundRunningTicket(Match match)
        {
            if (IsExistMarkedTickets(match))
            {
                return Background.PinkBlinking;
            }

            return IsExistRunningTickets(match) ? Background.Pink : string.Empty;
        }

        private bool IsOnlyMarkedTicket(Match match)
        {
            return IsExistMarkedTickets(match) && !IsExistRunningTickets(match);
        }
    }
}