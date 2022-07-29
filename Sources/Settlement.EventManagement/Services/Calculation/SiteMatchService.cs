using Settlement.Core.Constants;
using Settlement.EventManagement.Models.Calculation;
using System.Linq;

namespace Settlement.EventManagement.Services.Calculation
{
    public interface SiteMatchService
    {
        bool IsEventStatusOnSite(Match match);

        bool IsExistMarkedTickets(Match match);

        bool IsExistRunningTickets(Match match);

        string GetBackgroundCompletedStatus(Match match);

        string FastMarketStatus(Match match);

        string EarlySettlementStatus(Match match);

        bool IsExistFgLg(Match match);

        bool IsExistHtFgLg(Match match);

        bool IsExistMarkedTicketParlay(Match match);

        bool IsExistRunningTicketParlay(Match match);

        bool IsExistMarkedTicketsSingle(Match match);
    }

    public class SiteMatchServiceImp : SiteMatchService
    {
        private const int IsSuccess = 2;

        private const int MatchPen = 202;

        public bool IsEventStatusOnSite(Match match)
        {
            var isNull = match.SiteMatch.All(m => m.IsCalculatingSingle == null);
            var isSuccess = match.SiteMatch.All(m => m.IsCalculatingSingle == IsSuccess);

            return (match.IsCalculatingSingle == null && isNull) || (match.IsCalculatingSingle == IsSuccess && isSuccess);
        }

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
            return match.IsExistMarkedTicketParlay || isExistRunningTicketParlay;
        }

        public string GetBackgroundCompletedStatus(Match match)
        {
            return IsOnlyMarkedTicket(match)
                ? Background.WhiteBlinking
                : GetBackgroundRunningTicket(match);
        }

        public string EarlySettlementStatus(Match match)
        {
            var matchSite = match.SiteMatch;
            var isExistEarlyBetTypes = match.IsExistEarlyBetTypes || matchSite.Exists(m => m.IsExistEarlyBetTypes);
            var isRunningEarlyBetTypes = match.IsRunningEarlyBetTypes || matchSite.Exists(m => m.IsRunningEarlyBetTypes);
            var isWaitingEarlyBetTypes = match.IsWaitingEarlyBetTypes || matchSite.Exists(m => m.IsWaitingEarlyBetTypes);
            if (!isExistEarlyBetTypes && (match.ChildMatchType == MatchPen || match.IsOpenOdds))
            {
                return "No Ticket";
            }

            if (!isExistEarlyBetTypes)
            {
                return "N/A";
            }

            if (isRunningEarlyBetTypes)
            {
                return "Running";
            }

            if (isWaitingEarlyBetTypes)
            {
                return "Waiting";
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

        private string GetBackgroundRunningTicket(Match match)
        {
            if (IsExistMarkedTickets(match))
            {
                return Background.PinkBlinking;
            }

            return IsExistRunningTicket(match) ? Background.Pink : string.Empty;
        }

        private bool IsOnlyMarkedTicket(Match match)
        {
            return IsExistMarkedTickets(match) && !IsExistRunningTicket(match);
        }

        private bool IsExistRunningTicket(Match match)
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