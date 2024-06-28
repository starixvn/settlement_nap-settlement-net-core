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
    private List<string> siteDbServers = ["01", "02"];

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
    public async Task HandleResultAmendment_ProcessResultAmendmentThrowsException_ReturnFalse()
    {
        // Arrange
        var settleCriteria = new SettleCriteria();
        var selectedResources = new List<ResourceItem>();

        repository.FetchAsync<ResultChanged>(Arg.Any<CheckReSettleCriteria>()).Throws(new Exception());

        // Act
        var result = await resultAmendmentService.HandleResultAmendment(settleCriteria, selectedResources);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task UpdateResultHistory_ShouldCallRepositoryExecuteAsyncForEachServer()
    {
        // Arrange
        var criteria = new ResultHistoryUpdateCriteria();

        // Act
        await resultAmendmentService.UpdateResultHistory(criteria);

        // Assert
        repository.Received(siteDbServers.Count).ExecuteAsync(criteria);
    }
}