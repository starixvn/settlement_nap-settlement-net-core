using System;
using System.Collections.Generic;
using System.Linq;
using Settlement.Core.Models;
using Settlement.FastMarkets.Constants;
using Settlement.FastMarkets.Models;

namespace Settlement.FastMarkets.Services
{
    public interface MergeDataService
    {
        public (List<FastMarketTicketDetail>, TicketCounts) MergeFastMarketTicketDetail(List<(List<FastMarketTicketDetail>, TicketCounts)> data);
    }

    public class MergeDataServiceImp : MergeDataService
    {
        public MergeDataServiceImp()
        {

        }

        public (List<FastMarketTicketDetail>, TicketCounts) MergeFastMarketTicketDetail(List<(List<FastMarketTicketDetail>, TicketCounts)> data)
        {
            var multipleFastMarketTickets = new List<List<FastMarketTicketDetail>>();
            var multipleTicketCounts = new List<TicketCounts>();
            foreach(var item in data)
            {
                multipleFastMarketTickets.Add(item.Item1);
                multipleTicketCounts.Add(item.Item2);
            }

            var fastMarketTickets = ResolveFastMarketTickets(multipleFastMarketTickets);
            var ticketCounts = ResolveTicketCounts(multipleTicketCounts);

            return (fastMarketTickets, ticketCounts);
        }

        private List<FastMarketTicketDetail> ResolveFastMarketTickets(List<List<FastMarketTicketDetail>> data)
        {
            var baseData = data.First();
            var siteData = data.Skip(1).ToList();
            foreach(var details in siteData)
            {
                var newResult = details.Except(baseData);
                if (newResult.Any())
                {
                    baseData.AddRange(newResult);
                }

                SumTicketDetails(baseData, details);
            }

            return baseData;
        }

        private void SumTicketDetails(List<FastMarketTicketDetail> baseData, List<FastMarketTicketDetail> siteData)
        {
            baseData.ForEach(item =>
            {
                var ticketCount = siteData.FirstOrDefault(data => data.BetType == item.BetType && data.Position == item.Position);
                if (ticketCount != null)
                {
                    SumTicketDetail(item, ticketCount);
                }
            });
        }

        private void SumTicketDetail(FastMarketTicketDetail baseDetail, FastMarketTicketDetail siteDetail)
        {
            baseDetail.TicketCount += siteDetail.TicketCount;
            baseDetail.TicketRunning += siteDetail.TicketRunning;
            baseDetail.TicketMarked += siteDetail.TicketMarked;
        }

        private TicketCounts ResolveTicketCounts(List<TicketCounts> data)
        {
            foreach (var ticketCounts in data.Skip(1))
            {
                SumTicket(data[0], ticketCounts);
            }

            return data[0];
        }

        private void SumTicket(TicketCounts baseTicketCounts, TicketCounts siteTicketCounts)
        {
            baseTicketCounts.BetRunningCount += siteTicketCounts.BetRunningCount;
            baseTicketCounts.BetMarkedCount += siteTicketCounts.BetMarkedCount;
            baseTicketCounts.BetSettledCount += siteTicketCounts.BetSettledCount;
            baseTicketCounts.BetWaitingCount += siteTicketCounts.BetWaitingCount;
            baseTicketCounts.BetCount += siteTicketCounts.BetCount;
        }
    }
}
