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
        public (List<FastMarketResult>, TicketCounts) MergeFastMarketTicketDetail(List<(List<FastMarketResult>, TicketCounts)> data);
    }

    public class MergeDataServiceImp : MergeDataService
    {
        public MergeDataServiceImp()
        {

        }

        public (List<FastMarketResult>, TicketCounts) MergeFastMarketTicketDetail(List<(List<FastMarketResult>, TicketCounts)> data)
        {
            var multipleFastMarketResults = new List<List<FastMarketResult>>();
            var multipleTicketCounts = new List<TicketCounts>();
            foreach(var item in data)
            {
                multipleFastMarketResults.Add(item.Item1);
                multipleTicketCounts.Add(item.Item2);
            }

            var fastMarketResults = ResolveFastMarketResults(multipleFastMarketResults);
            var ticketCounts = ResolveTicketCounts(multipleTicketCounts);

            return (fastMarketResults, ticketCounts);
        }

        private List<FastMarketResult> ResolveFastMarketResults(List<List<FastMarketResult>> data)
        {
            var baseResult = data.First();
            var siteResults = data.Skip(1).ToList();
            var conflictData = new List<FastMarketResult>();
            foreach(var siteResult in siteResults)
            {
                var newResult = siteResult.Except(baseResult);
                if (newResult.Any())
                {
                    baseResult.AddRange(newResult);
                }

                var conflictResults = baseResult.FindAll(result =>
                {
                    var correspondingResult = siteResult.Find(r => r.BetType == result.BetType && r.Position == result.Position);
                    return correspondingResult != null && result.TicketStatus != correspondingResult.TicketStatus;
                });

                conflictData = conflictData.Union(conflictResults).ToList();
            }

            if (conflictData.Any())
            {
                foreach(var conflictResult in conflictData)
                {
                    conflictResult.MultipleTicketStatus.Add(conflictResult.TicketStatus);
                    foreach(var siteResult in siteResults)
                    {
                        var correspondingResult = siteResult.Find(r => r.BetType == conflictResult.BetType && r.Position == conflictResult.Position);
                        conflictResult.MultipleTicketStatus.Add(conflictResult.TicketStatus);
                    }

                    conflictResult.TicketStatus = MergeTicketStatus(conflictResult);
                }
            }

            return baseResult;
        }

        private int MergeTicketStatus(FastMarketResult result)
        {
            if (result.MultipleTicketStatus.Any(status => status == TicketStatus.Marked))
            {
                return TicketStatus.Marked;
            }

            if (result.MultipleTicketStatus.Any(status => status == TicketStatus.Running))
            {
                return TicketStatus.Running;
            }

            if (result.MultipleTicketStatus.Any(status => status == TicketStatus.Calculated))
            {
                return TicketStatus.Calculated;
            }

            return result.TicketStatus;
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
