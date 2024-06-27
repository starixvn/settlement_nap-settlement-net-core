using Settlement.Core.Constants;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.TableTennis;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.TableTennis;

public class ChildMatchServiceTests
{
    private readonly ChildMatchService service = new();

    [Fact]
    public void Decorate_ShouldOrderChildMatchModelsByChildMatchType()
    {
        // Arrange
        var childMatches = new List<ChildMatchModel>
            {
                new() { ChildMatchType = 2 },
                new() { ChildMatchType = 1 },
                new() { ChildMatchType = 3 }
            };

        var resultDetails = new List<ResultDetail>
            {
                new() { ResourceId = "01"},
                new() { ResourceId = ResourceType.Final }
            };

        var tuple = new Tuple<List<ChildMatchModel>, List<ResultDetail>>(childMatches, resultDetails);

        // Act
        service.Decorate(tuple);

        // Assert
        Assert.Equal(1, tuple.Item1[0].ChildMatchType);
        Assert.Equal(2, tuple.Item1[1].ChildMatchType);
        Assert.Equal(3, tuple.Item1[2].ChildMatchType);
    }
}