using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using NSubstitute.ExceptionExtensions;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Criteria.Cricket;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Cricket;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Cricket;

using Settlement.Models;

public class ResultAmendmentServiceTests
{
    private readonly IDynamicRepository repository;
    private readonly ResultAmendmentService resultAmendmentService;
    private readonly List<string> siteDbServers = new List<string> { "01", "02" };

    public ResultAmendmentServiceTests()
    {
        var appSettingsKey = new AppSettingsKey { SiteDbServer = siteDbServers };
        var options = Options.Create(appSettingsKey);
        repository = Substitute.For<IDynamicRepository>();

        var generateResultAmendmentService = Substitute.For<GenerateResultAmendmentService>();
        resultAmendmentService = new ResultAmendmentServiceImp(repository, options, generateResultAmendmentService);
    }

    [Fact]
    public async Task HandleResultAmendment_EmptyResultChanged_ReturnTrue()
    {
        // Arrange
        var settleCriteria = new SettleCriteria();
        var selectedResources = new List<ResourceItem>();

        repository.FetchAsync<ResultChanged>(Arg.Any<CheckReSettleCriteria>())
            .Returns(new List<ResultChanged>());

        // Act
        var result = await resultAmendmentService.HandleResultAmendment(settleCriteria, selectedResources);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task HandleResultAmendment_HasResultChanged_ReturnTrue()
    {
        // Arrange
        var settleCriteria = new SettleCriteria
        {
            Action = "CAL",
        };
        var selectedResources = new List<ResourceItem>();

        repository.FetchAsync<ResultChanged>(Arg.Any<CheckReSettleCriteria>()).Returns(
        [
           new ResultChanged
            {
                ResourceId = "R12345",
                HomeValue = "50",
                AwayValue = "40",
                Action = "CAL",
                OtherInfo = "Info1",
                LogDate = new DateTime(2023, 1, 1, 12, 0, 0),
                ReSettleType = 1
            },
            new ResultChanged
            {
                ResourceId = "R67890",
                HomeValue = "60",
                AwayValue = "55",
                Action = "REFUND",
                OtherInfo = "Info2",
                LogDate = new DateTime(2023, 2, 1, 13, 0, 0),
                ReSettleType = 2
            },
        ]);

        // Act
        var result = await resultAmendmentService.HandleResultAmendment(settleCriteria, selectedResources);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task UpdateResultHistory_ShouldCallRepositoryExecuteAsyncForEachServer()
    {
        // Arrange
        var criteria = new ResultHistoryUpdateCriteria();

        // Act
        await resultAmendmentService.UpdateResultHistory(criteria);

        // Assert
        await repository.Received(siteDbServers.Count).ExecuteAsync(criteria);
    }
}