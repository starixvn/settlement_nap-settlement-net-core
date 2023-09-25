using Fanex.Settlement.ScaleOut.Request;
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

    private readonly IMatchService service;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly NewInfoMatchService newInfoMatchService;

    public MatchServiceTests()
    {
        matchResultDetailService = Substitute.For<IMatchResultDetailService>();
        var refDataService = Substitute.For<IRefDataService>();
        scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
        newInfoMatchService = Substitute.For<NewInfoMatchService>();
        var compareMatchService = Substitute.For<CompareMatchService>();

        service = new MatchServiceImp(refDataService, matchResultDetailService, compareMatchService, newInfoMatchService, scaleOutSettleService);
    }

    [Fact]
    public void GetScoreForMatchBySportType_IsTennis_InvokeTennisResultDetailMethodOnMatchResultDetailService()
    {
        // Act
        service.GetScoreForMatchBySportType(new List<Match>(), new List<ResultDetail>(), SportType.Tennis);

        // Assert
        matchResultDetailService.Received().TennisResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
    }

    [Fact]
    public void GetScoreForMatchBySportType_IsBasketBall_InvokeBasketballResultDetailMethodOnMatchResultDetailService()
    {
        // Act
        service.GetScoreForMatchBySportType(new List<Match>(), new List<ResultDetail>(), SportType.BasketBall);

        // Assert
        matchResultDetailService.Received().BasketballResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
    }

    [Fact]
    public void GetScoreForMatchBySportType_IsESports_InvokeESportsResultDetailMethodOnMatchResultDetailService()
    {
        // Act
        service.GetScoreForMatchBySportType(new List<Match>(), new List<ResultDetail>(), SportType.ESports);

        // Assert
        matchResultDetailService.Received().ESportsResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
    }

    [Fact]
    public void GetScoreForMatchBySportType_IsBadminton_InvokeBadmintonResultDetailMethodOnMatchResultDetailService()
    {
        // Act
        service.GetScoreForMatchBySportType(new List<Match>(), new List<ResultDetail>(), SportType.Badminton);

        // Assert
        matchResultDetailService.Received().BadmintonResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
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
        var newMatches = service.GetScoreForMatchBySportType(matches, new List<ResultDetail>(), 90);

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
        var newMatches = service.GetScoreForMatchBySportType(matches, new List<ResultDetail>(), 4);

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
        var newMatches = service.GetScoreForMatchBySportType(matches, new List<ResultDetail>(), 3);

        // Assert
        Assert.True(matches.Count == newMatches.Count);
    }

    [Fact]
    public void UpdateMatchInfo_Always_CallServiceScaleOut()
    {
        service.UpdateMatchInfo(new UpdateMatchInfoRequest());

        scaleOutSettleService.Received().UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
    }

    [Fact]
    public async Task SetNewMatchInfo_Always_returnMatchMerged()
    {
        newInfoMatchService.TicketInfo(Arg.Do<Match>(item =>
        {
            item.IsExistMarkedTicket = item.IsExistRunningTicket = true;
            item.IsCalculatingSingle = 1;
        }));
        newInfoMatchService.NewEventStatus(Arg.Any<Match>(), Arg.Any<List<ResultDetail>>()).Returns("EventStatus");
        newInfoMatchService.EventStatusColor(Arg.Any<Match>()).Returns("EventStatusColor");
        newInfoMatchService.EarlySettlementStatus(Arg.Any<Match>()).Returns("Early");
        newInfoMatchService.ConfirmScore(Arg.Any<List<ResultDetail>>(), ResourceType.Halftime).Returns("1");
        newInfoMatchService.ConfirmScore(Arg.Any<List<ResultDetail>>(), ResourceType.Final).Returns("2");
        newInfoMatchService.IsExistsConfirmedEarly(Arg.Any<Match>()).Returns(true);

        var matches = await service.SetNewMatchInfo(new List<Match> { new() }, new List<ResultDetail>());
        var match = matches.First();

        Assert.True(match.IsExistsConfirmedEarly && match.IsExistMarkedTicket && match is { IsExistRunningTicket: true, IsCalculatingSingle: 1 });
        Assert.Equal("EventStatus", match.NewEventStatus);
        Assert.Equal("EventStatusColor", match.EventStatusColor);
        Assert.Equal("Early", match.EarlySettleStatus);
        Assert.Equal("1", match.ConfirmHalfTimeScore);
        Assert.Equal("2", match.ConfirmFullTimeScore);
    }
}