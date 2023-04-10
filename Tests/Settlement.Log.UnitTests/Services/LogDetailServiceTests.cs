using Fanex.Data.Repository;
using Settlement.Log.Criteria;
using Settlement.Log.Models;
using Settlement.Log.Services;

namespace Settlement.Log.UnitTests.Services;

public class LogDetailServiceTests
{
    private readonly RemarkService remarkService;
    private readonly IDynamicRepository repository;

    public LogDetailServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        remarkService = Substitute.For<RemarkService>();
    }

    [Fact]
    public async Task GetLogDetailByMatchAndProduct_Always_ReturnsListLogDetailsModels()
    {
        // Arrange
        var fakeList = new List<LogDetailsModels>
            {
                new() {  Action = "Cal"}
            };

        repository.FetchAsync<LogDetailsModels>(Arg.Any<GetLogDetailByMatchAndProductCriteria>()).Returns(fakeList);
        remarkService.IsFastMarketAction(Arg.Any<int>()).Returns(true);
        var service = new LogDetailServiceImp(repository, remarkService);

        // Act
        var result = await service.GetLogDetailByMatchAndProduct(1, string.Empty);

        // Assert
        remarkService.Received().RemarkValue(Arg.Any<string>());
        Assert.Single(result);
    }
}