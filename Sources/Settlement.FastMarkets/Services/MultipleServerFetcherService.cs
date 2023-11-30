using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Models;

namespace Settlement.FastMarkets.Services;

public interface MultipleServerFetcherService
{
    Task<(List<FastMarketResult> ticketDetails, TicketCounts ticketCounts)> GetFastMarketTicketDetail(int matchId);
}

public class MultipleServerFetcherServiceImp : MultipleServerFetcherService
{
    private readonly IDynamicRepository repository;

    private readonly AppSettingsKey appSettingsKey;

    private readonly MergeDataService mergeDataService;

    public MultipleServerFetcherServiceImp(IDynamicRepository repository,
        MergeDataService mergeDataService,
        IOptions<AppSettingsKey> appSettingsKey)
    {
        this.repository = repository;
        this.appSettingsKey = appSettingsKey.Value;
        this.mergeDataService = mergeDataService;
    }

    public async Task<(List<FastMarketResult> ticketDetails, TicketCounts ticketCounts)> GetFastMarketTicketDetail(int matchId)
    {
        var criteria = new GetFastMarketTicketDetailCriteria { MatchId = matchId };
        var multipleTicketDetails = new List<(List<FastMarketResult>, TicketCounts)>();
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            var ticketDetails = await GetTicketDetailByServer(criteria, server);
            multipleTicketDetails.Add(ticketDetails);
        }

        return mergeDataService.MergeFastMarketTicketDetail(multipleTicketDetails);
    }

    private async Task<(List<FastMarketResult> betTypes, TicketCounts ticketCounts)> GetTicketDetailByServer(GetFastMarketTicketDetailCriteria criteria, string server)
    {
        criteria.DbServer = server;
        var (ticketCounts, betTypeTickets) = await repository.FetchMultipleAsync<TicketCounts, FastMarketResult>(criteria);

        return (betTypeTickets.ToList(), ticketCounts.FirstOrDefault());
    }
}