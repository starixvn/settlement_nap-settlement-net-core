using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Models;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Services;

namespace Settlement.FastMarkets.UnitTests.Services;

public class MultipleServerFetcherServiceTests
{
    private readonly MultipleServerFetcherService service;

    private readonly IDynamicRepository repository;

    private readonly MergeDataService mergeDataService;

    public MultipleServerFetcherServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        mergeDataService = Substitute.For<MergeDataService>();
        var appSettings = new AppSettingsKey { SiteDbServer = ["01", "02"] };
        var options = Options.Create(appSettings);
        service = new MultipleServerFetcherServiceImp(repository, mergeDataService, options);
    }

    [Fact]
    public async Task GetFastMarketTicketDetail_Always_ExecuteFromMultiDb()
    {
        var data = (new List<TicketCounts>(), new List<FastMarketResult>());
        repository.FetchMultipleAsync<TicketCounts, FastMarketResult>(Arg.Any<GetFastMarketTicketDetailCriteria>()).Returns(data);

        await service.GetFastMarketTicketDetail(100);

        await repository.Received(2).FetchMultipleAsync<TicketCounts, FastMarketResult>(Arg.Any<GetFastMarketTicketDetailCriteria>());
        mergeDataService.Received()
            .MergeFastMarketTicketDetail(Arg.Any<List<(List<FastMarketResult>, TicketCounts)>>());
    }
}