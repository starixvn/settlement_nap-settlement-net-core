using Settlement.ThirdPartyProducts.Models;
using System.Collections.Generic;
using System.Linq;
using Settlement.Core.Constants;

namespace Settlement.ThirdPartyProducts.Services
{
    public interface MergeMatchInfo
    {
        string ParlayStatus(MatchDetailModel match);

        int QueueStatus(MatchDetailModel match);

        void AddSiteMatch(List<MatchDetailModel> matches, List<Models.SiteMatch> siteMatches);

        void MergeStatusTicket(List<ResourceSelectionItemModel> baseList, List<ResourceSelectionItemModel> siteList);
    }

    public class MergeMatchInfoImp : MergeMatchInfo
    {
        public void AddSiteMatch(List<MatchDetailModel> matches, List<SiteMatch> siteMatches)
        {
            matches.ForEach(item =>
            {
                var siteMatch = siteMatches.FirstOrDefault(match => match.MatchId == item.MatchId);
                if (siteMatch != null && (item.SiteMatch.Count == 0 || IsChangedOnTicket(item.SiteMatch.First(), siteMatch)))
                {
                    item.SiteMatch.Add(siteMatch);
                }
            });
        }

        public string ParlayStatus(MatchDetailModel match)
        {
            var totalTickets = match.SiteMatch.Select(x => x.TotalTickets).Sum();
            var totalTicketRunning = match.SiteMatch.Select(x => x.TotalTicketsRunning).Sum();
            if (totalTickets == 0)
            {
                return "No Ticket";
            }

            return totalTicketRunning > 0 ? "Running" : "Completed";
        }

        public int QueueStatus(MatchDetailModel match)
        {
            if (match.SiteMatch.FirstOrDefault(i => i.QueueStatus == CalculateStatus.IsWaiting) != null)
            {
                return CalculateStatus.IsWaiting;
            }

            return match.SiteMatch.FirstOrDefault(i => i.QueueStatus == CalculateStatus.IsCalculating) != null ? CalculateStatus.IsCalculating : CalculateStatus.IsSuccess;
        }

        public void MergeStatusTicket(List<ResourceSelectionItemModel> baseList, List<ResourceSelectionItemModel> siteList)
        {
            foreach (var item in baseList)
            {
                var siteItem = siteList.FirstOrDefault(i => i.MarketId == item.MarketId);
                if (siteItem != null)
                {
                    item.IsRunning = item.IsRunning || siteItem.IsRunning;
                }
            }
        }

        private static bool IsChangedOnTicket(Models.SiteMatch match, Models.SiteMatch siteMatch)
        {
            return match.TotalTickets != siteMatch.TotalTickets
                || match.TotalTicketsRunning != siteMatch.TotalTicketsRunning
                || match.QueueStatus != siteMatch.QueueStatus;
        }
    }
}