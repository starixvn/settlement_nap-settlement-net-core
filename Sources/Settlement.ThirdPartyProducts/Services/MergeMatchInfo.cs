using Settlement.ThirdPartyProducts.Models;
using System.Collections.Generic;
using System.Linq;

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
        private const int Waitting = 0;

        private const int Calculating = 1;

        private const int None = 2;

        public void AddSiteMatch(List<MatchDetailModel> matches, List<Models.SiteMatch> siteMatches)
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
            var totalTicketRunning = match.SiteMatch.Select(x => x.TotalTickets).Sum();
            if (totalTickets == 0)
            {
                return "No Ticket";
            }

            if (totalTicketRunning > 0)
            {
                return "Running";
            }

            return "Completed";
        }

        public int QueueStatus(MatchDetailModel match)
        {
            if (match.SiteMatch.FirstOrDefault(i => i.QueueStatus == Waitting) != null)
            {
                return Waitting;
            }

            if (match.SiteMatch.FirstOrDefault(i => i.QueueStatus == Calculating) != null)
            {
                return Calculating;
            }

            return None;
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

        private bool IsChangedOnTicket(Models.SiteMatch match, Models.SiteMatch siteMatch)
        {
            return match.TotalTickets != siteMatch.TotalTickets
                || match.TotalTicketsRunning != siteMatch.TotalTicketsRunning
                || match.QueueStatus != siteMatch.QueueStatus;
        }
    }
}