using Settlement.ThirdPartyProducts.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.ThirdPartyProducts.Services
{
    public interface MergeMatchInfo
    {
        string ParlayStatus(MatchDetailModel match);

        int QueueStatus(MatchDetailModel match);
    }

    public class MergeMatchInfoImp : MergeMatchInfo
    {
        private const int Waitting = 0;

        private const int Calculating = 1;

        private const int None = 2;

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
    }
}