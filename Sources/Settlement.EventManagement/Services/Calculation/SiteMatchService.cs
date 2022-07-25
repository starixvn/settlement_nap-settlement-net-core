using Settlement.Core.Constants;
using Settlement.EventManagement.Models.Calculation;
using System.Linq;

namespace Settlement.EventManagement.Services.Calculation
{
    public interface SiteMatchService
    {
        bool IsEventStatusOnSite(Match match);

        bool IsExistMarkedTickets(Match match);

        string GetBackgroundCompletedStatus(Match match);

        string AutoSettleFastMarket(Match match);

        string EarlySettlementStatus(Match match);
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

        public bool IsExistMarkedTickets(Match match)
        {
            var isExistMarkedTicketOnSite = match.SiteMatch.Exists(m => m.IsExistMarkedTicket);
            return match.IsExistMarkedTicket || isExistMarkedTicketOnSite;
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
            var isExistEarlyBetTypes = match.IsExistEarlyBetTypes || matchSite.Any(m => m.IsExistEarlyBetTypes);
            var isRunningEarlyBetTypes = match.IsRunningEarlyBetTypes || matchSite.Any(m => m.IsRunningEarlyBetTypes);
            var isWaitingEarlyBetTypes = match.IsWaitingEarlyBetTypes || matchSite.Any(m => m.IsWaitingEarlyBetTypes);
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

        public string AutoSettleFastMarket(Match match)
        {
            var matchSite = match.SiteMatch;
            var isExistFastMarket = match.IsExistFastMarket || matchSite.Any(m => m.IsExistFastMarket);
            var isRunningFastMarket = match.IsRunningFastMarket || matchSite.Any(m => m.IsRunningFastMarket);
            var isExistFastMarketResult = match.IsExistFastMarketResult || matchSite.Any(m => m.IsExistFastMarketResult);
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
    }
}