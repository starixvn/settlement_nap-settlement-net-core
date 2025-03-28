using Fanex.Settlement.ScaleOut.Services;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Services;
using Settlement.EventManagement.Services.MultiSports;
using Match = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.UnitTests.Services.MultiSports;

public class MatchServiceTests
{
    private readonly IMatchResultDetailService matchResultDetailService;

    private readonly MatchServiceImp service;

    public MatchServiceTests()
    {
        matchResultDetailService = Substitute.For<IMatchResultDetailService>();
        var refDataService = Substitute.For<IRefDataService>();
        var scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
        var newInfoMatchService = Substitute.For<NewInfoMatchService>();

        service = new MatchServiceImp(refDataService, matchResultDetailService, newInfoMatchService, scaleOutSettleService);
    }

    [Fact]
    public void GetScoreForMatchBySportType_IsTennis_InvokeTennisResultDetailMethodOnMatchResultDetailService()
    {
        // Act
        service.GetScoreForMatchBySportType([], [], SportType.Tennis);

        // Assert
        matchResultDetailService.Received().TennisResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<bool>());
    }

    [Fact]
    public void GetScoreForMatchBySportType_IsBasketBall_InvokeBasketballResultDetailMethodOnMatchResultDetailService()
    {
        // Act
        service.GetScoreForMatchBySportType([], [], SportType.BasketBall);

        // Assert
        matchResultDetailService.Received().BasketballResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<bool>());
    }

    [Fact]
    public void GetScoreForMatchBySportType_IsESports_InvokeESportsResultDetailMethodOnMatchResultDetailService()
    {
        // Act
        service.GetScoreForMatchBySportType([], [], SportType.ESports);

        // Assert
        matchResultDetailService.Received().ESportsResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<bool>());
    }

    [Fact]
    public void GetScoreForMatchBySportType_IsBadminton_InvokeBadmintonResultDetailMethodOnMatchResultDetailService()
    {
        // Act
        service.GetScoreForMatchBySportType([], [], SportType.Badminton);

        // Assert
        matchResultDetailService.Received().BadmintonResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<bool>());
    }

    [Fact]
    public void GetScoreForMatchBySportType_IsOtherSport_ReturnsDefaultMatchesData()
    {
        // Arrange
        var matches = new List<Match>
            {
                new() { MatchId = 1 },
                new() { MatchId = 2 }
            };

        // Act
        var newMatches = service.GetScoreForMatchBySportType(matches, [], 90);

        // Assert
        Assert.True(matches.Count == newMatches.Count);
    }

    [Fact]
    public void GetScoreForMatchBySportType_IsIceHockey_ReturnsDefaultMatchesData()
    {
        // Arrange
        var matches = new List<Match>
            {
                new() { MatchId = 1 },
                new() { MatchId = 2 }
            };
        matchResultDetailService.OtherSportsResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), false).Returns(matches);

        // Act
        var newMatches = service.GetScoreForMatchBySportType(matches, [], 4);

        // Assert
        Assert.True(matches.Count == newMatches.Count);
    }

    [Fact]
    public void GetScoreForMatchBySportType_IsFootball_ReturnsDefaultMatchesData()
    {
        // Arrange
        var matches = new List<Match>
            {
                new() { MatchId = 1 },
                new() { MatchId = 2 }
            };
        matchResultDetailService.OtherSportsResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), true).Returns(matches);

        // Act
        var newMatches = service.GetScoreForMatchBySportType(matches, [], 3);

        // Assert
        Assert.True(matches.Count == newMatches.Count);
    }
}