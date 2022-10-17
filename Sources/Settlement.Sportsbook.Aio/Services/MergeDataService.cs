using Settlement.Core.Models;
using System.Collections.Generic;
using System.Linq;

namespace Settlement.Sportsbook.Aio.Services
{
    public interface MergeDataService
    {
        public (List<Models.ResultDetail> ticketDetails, TicketCounts ticketCounts) MergeTicketDetails(List<(List<Models.ResultDetail>, TicketCounts)> data);
    }

    public class MergeDataServiceImp : MergeDataService
    {
        public (List<Models.ResultDetail> ticketDetails, TicketCounts ticketCounts) MergeTicketDetails(List<(List<Models.ResultDetail>, TicketCounts)> data)
        {
            var multipleTicketDetails = new List<List<Models.ResultDetail>>();
            var multipleTicketCounts = new List<TicketCounts>();
            foreach (var item in data)
            {
                multipleTicketDetails.Add(item.Item1);
                multipleTicketCounts.Add(item.Item2);
            }

            var ticketDetails = ResolveTicketDetails(multipleTicketDetails);
            var ticketCounts = ResolveTicketCounts(multipleTicketCounts);

            return (ticketDetails, ticketCounts);
        }

        private static List<Models.ResultDetail> ResolveTicketDetails(List<List<Models.ResultDetail>> data)
        {
            var baseData = data.First();
            var siteData = data.Skip(1).ToList();
            foreach (var details in siteData)
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

        private static void SumTicketDetails(List<Models.ResultDetail> baseData, List<Models.ResultDetail> siteData)
        {
            baseData.ForEach(item =>
            {
                var ticketCount = siteData.FirstOrDefault(data => data.ResourceId == item.ResourceId);
                if (ticketCount != null)
                {
                    SumTicketDetail(item, ticketCount);
                }
            });
        }

        private static void SumTicketDetail(Models.ResultDetail baseDetail, Models.ResultDetail siteDetail)
        {
            baseDetail.InRunning += siteDetail.InRunning;
            baseDetail.InWaiting += siteDetail.InWaiting;
            baseDetail.BetMarkedCount += siteDetail.BetMarkedCount;
            baseDetail.BetSettledCount += siteDetail.BetSettledCount;
            baseDetail.BetRefundedCount += siteDetail.BetRefundedCount;
            baseDetail.BetCount += siteDetail.BetCount;
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
        }
    }
}