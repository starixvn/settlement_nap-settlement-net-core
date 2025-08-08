using AutoMapper;
using Fanex.Data.Repository;
using NSubstitute;
using Settlement.Gaming.Criteria.NumberGame;
using Settlement.Gaming.Models.NumberGame;
using Settlement.Gaming.Requests;
using Settlement.Gaming.Services.NumberGame;

namespace Settlement.Gaming.UnitTests.Services;

public class MatchServiceTests
{
    private readonly IDynamicRepository repository = Substitute.For<IDynamicRepository>();
    private readonly IMapper mapper = Substitute.For<IMapper>();
    private readonly MatchServiceImp service;

    public MatchServiceTests()
    {
        service = new MatchServiceImp(repository, mapper);
    }

    [Fact]
    public async Task Matches_ReturnsGroupedMatches()
    {
        // Arrange
        var request = new NumberGameMatchRequest { MatchCode = "A" };
        var criteria = new GetNumberGameMatchCriteria();
        var matches = new List<MatchDetailModel>
        {
            new MatchDetailModel { MatchId = 1, LeagueId = 10, Number = "1" },
            new MatchDetailModel { MatchId = 1, LeagueId = 10, Number = "2" },
            new MatchDetailModel { MatchId = 2, LeagueId = 20, Number = "3" }
        };
        mapper.Map<NumberGameMatchRequest, GetNumberGameMatchCriteria>(request).Returns(criteria);
        repository.FetchAsync<MatchDetailModel>(criteria).Returns(matches);

        // Act
        var result = await service.Matches(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.Contains(result, m => m.MatchId == 1 && m.Number == "1,2");
        Assert.Contains(result, m => m.MatchId == 2 && m.Number == "3");
    }

    [Fact]
    public async Task Matches_ReturnsEmptyList_WhenNoMatches()
    {
        // Arrange
        var request = new NumberGameMatchRequest();
        var criteria = new GetNumberGameMatchCriteria();
        mapper.Map<NumberGameMatchRequest, GetNumberGameMatchCriteria>(request).Returns(criteria);
        repository.FetchAsync<MatchDetailModel>(criteria).Returns(new List<MatchDetailModel>());

        // Act
        var result = await service.Matches(request);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }
}
