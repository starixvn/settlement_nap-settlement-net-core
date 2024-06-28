using Fanex.Data.Repository;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services;

namespace Settlement.Sportsbook.Aio.UnitTests.Services;

public class ResultDetailServiceTests
{
    private readonly IDynamicRepository repository;
    private readonly ResultDetailService resultDetailService;

    public ResultDetailServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        resultDetailService = new ResultDetailServiceImp(repository);
    }

    [Fact]
    public async Task SetInterval_ShouldSetIntervalNoForAllResultDetails()
    {
        // Arrange
        const int sportType = 1;
        var resultDetails = new List<ResultDetail>
        {
            new() { ResourceId = "1" },
            new() { ResourceId = "2" },
            new() { ResourceId = "3" }
        };

        var resourceIndexes = new List<ResourceIndex>
        {
            new() { ResourceId = "1", IntervalNo = 10 },
            new() { ResourceId = "2", IntervalNo = 20 },
            new() { ResourceId = "3", IntervalNo = 30 }
        };

        repository.FetchAsync<ResourceIndex>(Arg.Any<GetResourceIndexCriteria>())
            .Returns(resourceIndexes);

        // Act
        await resultDetailService.SetInterval(sportType, resultDetails);

        // Assert
        Assert.Equal(10, resultDetails[0].IntervalNo);
        Assert.Equal(20, resultDetails[1].IntervalNo);
        Assert.Equal(30, resultDetails[2].IntervalNo);
    }
}