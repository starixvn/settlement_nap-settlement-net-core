using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Services;
using Settlement.EventManagement.Services.MultiSports;
using Match = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.UnitTests.Services.MultiSports;

public class MatchResultDetailServiceTests
{
    private readonly ScoreTennisService scoreTennisService;

    private readonly ScoreService scoreService;

    private readonly IExternalScoreService externalScoreService;

    private readonly IMatchResultDetailService service;

    public MatchResultDetailServiceTests()
    {
        scoreTennisService = Substitute.For<ScoreTennisService>();
        var refDataService = Substitute.For<IRefDataService>();
        externalScoreService = Substitute.For<IExternalScoreService>();
        scoreService = Substitute.For<ScoreService>();
        service = new MatchResultDetailServiceImp(scoreTennisService, refDataService, externalScoreService,
            scoreService);
    }

    private static List<Match> Matches => new()
    {
        new Match { MatchId = 1 }
    };

    private static List<ResultDetail> ResultDetail => new();

    private readonly Permission permission = new();

    [Fact]
    public void TennisResultDetail_EmptyMatch_ReturnsEmpty()
    {
        // Act
        var actual = service.TennisResultDetail(new List<Match>(), ResultDetail, permission);

        // Assert
        Assert.Empty(actual);
    }

    [Fact]
    public void TennisResultDetail_HasMatches_CallAllMethod()
    {
        // Arrange
        var matches = Matches;

        // Act
        var actualMatches = service.TennisResultDetail(matches, ResultDetail, permission);

        // Assert
        scoreTennisService.Received(1).ScoreLoader(Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        scoreService.Received(1).IsIntervalScore(Arg.Any<int>(), Arg.Any<List<ResultDetail>>());
        scoreTennisService.Received(1).GetEventStatus(Arg.Any<List<ResultDetail>>(), Arg.Any<string>());
        Assert.True(actualMatches.Count > 0);
    }

    [Fact]
    public void BasketballResultDetail_EmptyMatch_ReturnsEmpty()
    {
        // Act
        var actual = service.BasketballResultDetail(new List<Match>(), ResultDetail, permission);

        // Assert
        Assert.Empty(actual);
    }

    [Fact]
    public void BasketballResultDetail_HasMatches_CallAllMethod()
    {
        // Arrange
        var matches = Matches;

        // Act
        var actualMatches = service.BasketballResultDetail(matches, ResultDetail, permission);

        // Assert
        scoreService.Received(1).HalftimeScore(Arg.Any<int>(), Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        scoreService.Received(1).FinalScore(Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        scoreService.Received(1).ScoreOfSets(Arg.Any<List<ResultDetail>>(), Arg.Any<List<string>>(), Arg.Any<Permission>());
        scoreService.Received(1).IsIntervalScore(Arg.Any<int>(), Arg.Any<List<ResultDetail>>());
        Assert.True(actualMatches.Count > 0);
    }

    [Fact]
    public void CricketResultDetail_EmptyMatch_ReturnsEmpty()
    {
        // Act
        var actual = service.CricketResultDetail(new List<Match>(), ResultDetail, permission);

        // Assert
        Assert.Empty(actual);
    }

    [Fact]
    public void CricketResultDetail_HasMatches_CallAllMethod()
    {
        // Arrange
        var matches = Matches;

        // Act
        var actualMatches = service.CricketResultDetail(matches, ResultDetail, permission);

        // Assert
        scoreService.Received(1).HalftimeScore(Arg.Any<int>(), Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        scoreService.Received(1).FinalScore(Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        scoreService.Received(1).ScoreOfSets(Arg.Any<List<ResultDetail>>(), Arg.Any<List<string>>(), Arg.Any<Permission>());
        scoreService.Received(1).IsIntervalScore(Arg.Any<int>(), Arg.Any<List<ResultDetail>>());
        Assert.True(actualMatches.Count > 0);
    }

    [Fact]
    public void BadmintonResultDetail_EmptyMatch_ReturnsEmpty()
    {
        // Act
        var actual = service.BadmintonResultDetail(new List<Match>(), ResultDetail, permission);

        // Assert
        Assert.Empty(actual);
    }

    [Fact]
    public void BadmintonResultDetail_HasMatches_CallAllMethod()
    {
        // Arrange
        var matches = Matches;

        // Act
        var actualMatches = service.BadmintonResultDetail(matches, ResultDetail, permission);

        // Assert
        scoreService.Received(1).HalftimeScore(Arg.Any<int>(), Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        scoreService.Received(1).FinalScore(Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        scoreService.Received(1).ScoreOfSets(Arg.Any<List<ResultDetail>>(), Arg.Any<List<string>>(), Arg.Any<Permission>());
        scoreService.Received(1).IsIntervalScore(Arg.Any<int>(), Arg.Any<List<ResultDetail>>());
        Assert.True(actualMatches.Count > 0);
    }

    [Fact]
    public void ESportsResultDetail_EmptyMatch_ReturnsEmpty()
    {
        // Act
        var actual = service.ESportsResultDetail(new List<Match>(), ResultDetail, permission);

        // Assert
        Assert.Empty(actual);
    }

    [Theory]
    [InlineData(5)]
    [InlineData(15)]
    public void ESportsResultDetail_HasMatches_CallAllMethod(int bestOfMap)
    {
        // Arrange
        var matches = Matches;
        matches[0].BestOfMap = bestOfMap;

        // Act
        var actualMatches = service.ESportsResultDetail(matches, ResultDetail, permission);

        // Assert
        scoreService.Received(1).HalftimeScore(Arg.Any<int>(), Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        scoreService.Received(1).FinalScore(Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        scoreService.Received(1).ScoreOfSets(Arg.Any<List<ResultDetail>>(), Arg.Any<List<string>>(), Arg.Any<Permission>());
        scoreService.Received(1).IsIntervalScore(Arg.Any<int>(), Arg.Any<List<ResultDetail>>());
        Assert.True(actualMatches.Count > 0);
    }

    [Fact]
    public void BeachVolleyballResultDetail_EmptyMatch_ReturnsEmpty()
    {
        // Act
        var actual = service.BeachVolleyballResultDetail(new List<Match>(), ResultDetail, permission);

        // Assert
        Assert.Empty(actual);
    }

    [Fact]
    public void BeachVolleyballResultDetail_HasMatches_CallAllMethod()
    {
        // Arrange
        var matches = Matches;

        // Act
        var actualMatches = service.BeachVolleyballResultDetail(matches, ResultDetail, permission);

        // Assert
        scoreService.Received(1).HalftimeScore(Arg.Any<int>(), Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        scoreService.Received(1).FinalScore(Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        scoreService.Received(1).ScoreOfSets(Arg.Any<List<ResultDetail>>(), Arg.Any<List<string>>(), Arg.Any<Permission>());
        scoreService.Received(1).IsIntervalScore(Arg.Any<int>(), Arg.Any<List<ResultDetail>>());
        externalScoreService.Received(1).IsInconsistentScore(Arg.Any<Match>(), Arg.Any<List<ResultDetail>>());
        Assert.True(actualMatches.Count > 0);
    }

    [Fact]
    public void VolleyballResultDetail_EmptyMatch_ReturnsEmpty()
    {
        // Act
        var actual = service.VolleyballResultDetail(new List<Match>(), ResultDetail, permission);

        // Assert
        Assert.Empty(actual);
    }

    [Fact]
    public void VolleyballResultDetail_HasMatches_CallAllMethod()
    {
        // Arrange
        var matches = Matches;

        // Act
        var actualMatches = service.VolleyballResultDetail(matches, ResultDetail, permission);

        // Assert
        scoreService.Received(1).HalftimeScore(Arg.Any<int>(), Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        scoreService.Received(1).FinalScore(Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        scoreService.Received(1).ScoreOfSets(Arg.Any<List<ResultDetail>>(), Arg.Any<List<string>>(), Arg.Any<Permission>());
        scoreService.Received(1).IsIntervalScore(Arg.Any<int>(), Arg.Any<List<ResultDetail>>());
        Assert.True(actualMatches.Count > 0);
    }

    [Fact]
    public void OtherSportsResultDetail_EmptyMatch_ReturnsEmpty()
    {
        // Act
        var actual = service.OtherSportsResultDetail(new List<Match>(), ResultDetail, false);

        // Assert
        Assert.Empty(actual);
    }

    [Fact]
    public void OtherSportsResultDetail_HasMatches_CallAllMethod()
    {
        // Arrange
        var matches = Matches;

        // Act
        var actualMatches = service.OtherSportsResultDetail(matches, ResultDetail, true);

        // Assert
        externalScoreService.Received(1).LoadExternalResultForOtherSports(Arg.Any<Match>(), Arg.Any<List<ResultDetail>>(), Arg.Any<bool>());
        Assert.True(actualMatches.Count > 0);
    }
}