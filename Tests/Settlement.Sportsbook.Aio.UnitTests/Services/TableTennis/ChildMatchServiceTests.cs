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
                new() { ChildMatchType = 12, SportType = 18, },
                new() { ChildMatchType = 14, SportType = 18  },
                new() { ChildMatchType = 15 ,SportType = 18 }
            };

        var resultDetails = new List<ResultDetail>
            {
                new() { ResourceId = "0101"},
                 new() { ResourceId = "0102"},
                  new() { ResourceId = "0103"},
            };

        var tuple = new Tuple<List<ChildMatchModel>, List<ResultDetail>>(childMatches, resultDetails);

        // Act
        service.Decorate(tuple);

        // Assert
        Assert.Equal(12, tuple.Item1[0].ChildMatchType);
        Assert.Equal(14, tuple.Item1[1].ChildMatchType);
        Assert.Equal(15, tuple.Item1[2].ChildMatchType);
    }
}