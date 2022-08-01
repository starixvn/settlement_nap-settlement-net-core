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
        public Task<(List<FastMarketResult> betTypes, TicketCounts ticketCounts)> GetFastMarketTicketDetail(int matchId, string resources);
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

        public async Task<(List<FastMarketResult> betTypes, TicketCounts ticketCounts)> GetFastMarketTicketDetail(int matchId, string resources)
        {
            var criteria = new GetFastMarketTicketDetailCriteria {
                MatchId = matchId,
                Resources = resources
            };
            var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();
            var multipleTicketDetails = new List<(List<FastMarketResult>, TicketCounts)>();
            foreach (var server in servers)
            {
                var ticketDetails = await GetTicketDetailByServer(criteria, server);
                multipleTicketDetails.Add(ticketDetails);
            }

            return mergeDataService.MergeFastMarketTicketDetail(multipleTicketDetails);
        }

        private async Task<(List<FastMarketResult> betTypes, TicketCounts ticketCounts)> GetTicketDetailByServer(GetFastMarketTicketDetailCriteria criteria, string server)
        {
            criteria.DbServer = server;
            var (betTypes, ticketCounts) = await repository.FetchMultipleAsync<FastMarketResult, TicketCounts>(criteria);

            return (betTypes.ToList(), ticketCounts.FirstOrDefault());
        }
    }
}
