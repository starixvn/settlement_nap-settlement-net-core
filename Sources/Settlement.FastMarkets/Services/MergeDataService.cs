using System.Collections.Generic;
using System.Linq;
using Settlement.Core.Models;
using Settlement.FastMarkets.Models;

namespace Settlement.FastMarkets.Services
{
    public interface MergeDataService
    {
        public (List<FastMarketResult>, TicketCounts) MergeFastMarketTicketDetail(List<(List<FastMarketResult>, TicketCounts)> data);
    }

    public class MergeDataServiceImp : MergeDataService
    {
       
        public (List<FastMarketResult>, TicketCounts) MergeFastMarketTicketDetail(List<(List<FastMarketResult>, TicketCounts)> data)
        {
            var multipleFastMarketTickets = new List<List<FastMarketResult>>();
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

        private static List<FastMarketResult> ResolveFastMarketTickets(List<List<FastMarketResult>> data)
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

        private static void SumTicketDetails(List<FastMarketResult> baseData, List<FastMarketResult> siteData)
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

        private static void SumTicketDetail(FastMarketResult baseDetail, FastMarketResult siteDetail)
        {
            baseDetail.TicketCount += siteDetail.TicketCount;
            baseDetail.TicketRunning += siteDetail.TicketRunning;
            baseDetail.TicketMarked += siteDetail.TicketMarked;
        }

        private static TicketCounts ResolveTicketCounts(List<TicketCounts> data)
        {
            foreach (var ticketCounts in data.Skip(1))
            {
                SumTicket(data[0], ticketCounts);
            }

            return data[0];
        }

        private static void SumTicket(TicketCounts baseTicketCounts, TicketCounts siteTicketCounts)
        {
            baseTicketCounts.BetRunningCount += siteTicketCounts.BetRunningCount;
            baseTicketCounts.BetMarkedCount += siteTicketCounts.BetMarkedCount;
            baseTicketCounts.BetSettledCount += siteTicketCounts.BetSettledCount;
            baseTicketCounts.BetWaitingCount += siteTicketCounts.BetWaitingCount;
            baseTicketCounts.BetCount += siteTicketCounts.BetCount;
        }
    }
}
