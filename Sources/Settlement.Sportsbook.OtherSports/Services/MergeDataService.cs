using Settlement.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.OtherSports.Services
{
    public interface MergeDataService
    {
        void MergeMatchDetail(MatchDetail matchDetail, List<TicketCounts> ticketCounts);

        List<TicketCounts> MergeTicketCounts(List<List<TicketCounts>> multipleTicketCounts);

        void GroupTicketCount(List<TicketCounts> ticketCounts);
    }

    public class MergeDataServiceImp : MergeDataService
    {
        private const int HalfTimeGroupId = 1;

        private const int FullTimeGroupId = 2;

        public void MergeMatchDetail(MatchDetail matchDetail, List<TicketCounts> ticketCounts)
        {
            matchDetail.HtStatus = GetStatus(ticketCounts.FirstOrDefault(item => item.GroupId == HalfTimeGroupId));
            matchDetail.FtStatus = GetStatus(ticketCounts.FirstOrDefault(item => item.GroupId == FullTimeGroupId));
        }

        private string GetStatus(TicketCounts ticketCount)
        {
            if (ticketCount == null || ticketCount.BetCount == 0)
            {
                return "No Ticket";
            }

            if (ticketCount.BetRunningCount > 0)
            {
                return "Running";
            }

            if (ticketCount.BetMarkedCount > 0)
            {
                return "Marked";
            }

            if (ticketCount.BetWaitingCount > 0 && ticketCount.BetWaitingCount == ticketCount.BetCount)
            {
                return "Waiting";
            }

            return "Calculated";
        }

        public List<TicketCounts> MergeTicketCounts(List<List<TicketCounts>> multipleTicketCounts)
        {
            foreach (var ticketCounts in multipleTicketCounts.Skip(1))
            {
                SumTicketCounts(multipleTicketCounts[0], ticketCounts);
            }

            return multipleTicketCounts[0];
        }

        private void SumTicketCounts(List<TicketCounts> baseTicketCounts, List<TicketCounts> siteTicketCounts)
        {
            baseTicketCounts.ForEach(item =>
            {
                var ticketCount = siteTicketCounts.FirstOrDefault(count => count.GroupId == item.GroupId);
                if (ticketCount != null)
                {
                    SumTicket(item, ticketCount);
                }
            });
        }

        private void SumTicket(TicketCounts baseTicketCounts, TicketCounts siteTicketCounts)
        {
            baseTicketCounts.BetRunningCount += siteTicketCounts.BetRunningCount;
            baseTicketCounts.BetMarkedCount += siteTicketCounts.BetMarkedCount;
            baseTicketCounts.BetSettledCount += siteTicketCounts.BetSettledCount;
            baseTicketCounts.BetWaitingCount += siteTicketCounts.BetWaitingCount;
            baseTicketCounts.BetCount += siteTicketCounts.BetCount;
        }

        public void GroupTicketCount(List<TicketCounts> ticketCounts)
        {
            foreach (var ticketCount in ticketCounts.Skip(1))
            {
                SumTicket(ticketCounts[0], ticketCount);
            }

            ticketCounts[0].GroupId = 0;
        }
    }
}
