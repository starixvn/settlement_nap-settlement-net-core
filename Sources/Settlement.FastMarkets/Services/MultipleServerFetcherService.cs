using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fanex.Data.Repository;
using Microsoft.Extensions.Configuration;
using Settlement.Core.Models;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Models;

namespace Settlement.FastMarkets.Services
{
    public interface MultipleServerFetcherService
    {
        public Task<(List<FastMarketTicketDetail> ticketDetails, TicketCounts ticketCounts)> GetFastMarketTicketDetail(int matchId);
    }

    public class MultipleServerFetcherServiceImp : MultipleServerFetcherService
    {
        private readonly IDynamicRepository repository;

        private readonly IConfiguration configuration;

        private readonly MergeDataService mergeDataService;

        public MultipleServerFetcherServiceImp(IDynamicRepository repository,
            IConfiguration configuration,
            MergeDataService mergeDataService)
        {
            this.repository = repository;
            this.configuration = configuration;
            this.mergeDataService = mergeDataService;
        }

        public async Task<(List<FastMarketTicketDetail> ticketDetails, TicketCounts ticketCounts)> GetFastMarketTicketDetail(int matchId)
        {
            var criteria = new GetFastMarketTicketDetailCriteria {
                MatchId = matchId
            };
            var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();
            var multipleTicketDetails = new List<(List<FastMarketTicketDetail>, TicketCounts)>();
            foreach (var server in servers)
            {
                var ticketDetails = await GetTicketDetailByServer(criteria, server);
                multipleTicketDetails.Add(ticketDetails);
            }

            return mergeDataService.MergeFastMarketTicketDetail(multipleTicketDetails);
        }

        private async Task<(List<FastMarketTicketDetail> betTypes, TicketCounts ticketCounts)> GetTicketDetailByServer(GetFastMarketTicketDetailCriteria criteria, string server)
        {
            criteria.DbServer = server;
            var (ticketCounts, betTypeTickets) = await repository.FetchMultipleAsync<TicketCounts, FastMarketTicketDetail>(criteria);

            return (betTypeTickets.ToList(), ticketCounts.FirstOrDefault());
        }
    }
}
