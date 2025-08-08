using NSubstitute;
using Settlement.Core.Services;
using Settlement.Gaming.Models.NumberGame;
using Settlement.Gaming.Requests;
using Settlement.Gaming.Services.NumberGame;

namespace Settlement.Gaming.UnitTests.Services;

public class LeagueServiceTests
{
    private readonly MatchService matchService = Substitute.For<MatchService>();
    private readonly IRefDataService refDataService = Substitute.For<IRefDataService>();
    private readonly LeagueServiceImp service;

    public LeagueServiceTests()
    {
        service = new LeagueServiceImp(matchService, refDataService);
    }

    [Fact]
    public async Task Search_ReturnsLeaguesGroupedByLeagueId()
    {
        // Arrange
        var request = new NumberGameMatchRequest();
        var matches = new List<MatchDetailModel>
        {
            new MatchDetailModel { MatchId = 1, LeagueId = 10 },
            new MatchDetailModel { MatchId = 2, LeagueId = 10 },
            new MatchDetailModel { MatchId = 3, LeagueId = 20 }
        };
        matchService.Matches(request).Returns(matches);

        // Act
        var result = await service.Search(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.Contains(result, l => l.LeagueId == 10 && l.Matches.Count == 2);
        Assert.Contains(result, l => l.LeagueId == 20 && l.Matches.Count == 1);
        Assert.All(result, l => Assert.All(l.Matches, m => Assert.Equal(l.LeagueId, m.LeagueId)));
    }

    [Fact]
    public async Task Search_ReturnsEmptyList_WhenNoMatches()
    {
        // Arrange
        var request = new NumberGameMatchRequest();
        matchService.Matches(request).Returns(new List<MatchDetailModel>());

        // Act
        var result = await service.Search(request);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task Search_SetsRefDataServiceOnLeagues()
    {
        // Arrange
        var request = new NumberGameMatchRequest();
        var matches = new List<MatchDetailModel>
        {
            new MatchDetailModel { MatchId = 1, LeagueId = 10 }
        };
        matchService.Matches(request).Returns(matches);

        // Act
        var result = await service.Search(request);

        // Assert
        Assert.Single(result);
        Assert.Same(refDataService, result[0].RefDataService);
    }
}
