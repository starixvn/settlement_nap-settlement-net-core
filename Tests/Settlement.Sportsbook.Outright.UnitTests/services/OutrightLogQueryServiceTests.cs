using Fanex.Data.Repository;
using NSubstitute;
using Settlement.Outright.Criteria;
using Settlement.Outright.Models;
using Settlement.Outright.Requests;
using Settlement.Outright.Services;

namespace Settlement.Sportsbook.Outright.UnitTests.Services;

public class OutrightLogQueryServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly OutrightLogQueryService service;

    public OutrightLogQueryServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        service = new OutrightLogQueryServiceImp(repository);
    }

    [Fact]
    public async Task GetOutrightLog_Always_ReturnLogFromSP()
    {
        repository.GetAsync<OutrightLog>(Arg.Any<GetOutrightLogCriteria>()).Returns(new OutrightLog { OrId = 1000 });

        var actual = await service.GetOutrightLog(new GetLogRequest());

        Assert.Equal(1000, actual.OrId);
    }

    [Fact]
    public async Task GetOutrightLogs_Always_ReturnLogFromSP()
    {
        var listLog = new List<OutrightLog>
        {
            new()
        };
        repository.FetchAsync<OutrightLog>(Arg.Any<GetOutrightLogCriteria>()).Returns(listLog);

        var actual = await service.GetOutrightLogs(new GetLogRequest());

        Assert.Single(actual);
    }

    [Fact]
    public async Task GetOutrightLogDetails_Always_ReturnLogFromSP()
    {
        var listLog = new List<OutrightLogDetail>
        {
            new()
        };
        repository.FetchAsync<OutrightLogDetail>(Arg.Any<GetOutrightLogDetailCriteria>()).Returns(listLog);

        var actual = await service.GetOutrightLogDetails(new GetOutrightLogDetailCriteria());

        Assert.Single(actual);
    }
}