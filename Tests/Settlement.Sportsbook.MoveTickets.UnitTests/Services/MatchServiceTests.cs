using Settlement.Core.Models;
using Settlement.Core.Services;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Services;

public class MatchServiceTests
{
    private readonly IMatchResultDetailService matchResultDetailService;

    private readonly IRefDataService refDataService;

    private readonly CompareMatchService compareMatchService;

    private readonly NewInfoMatchService newInfoMatchService;

    private readonly IMatchService service;

    public MatchServiceTests()
    {
        refDataService = Substitute.For<IRefDataService>();
        compareMatchService = Substitute.For<CompareMatchService>();
        newInfoMatchService = Substitute.For<NewInfoMatchService>();
        matchResultDetailService = Substitute.For<IMatchResultDetailService>();
        service = new MatchServiceImp(matchResultDetailService, refDataService, compareMatchService, newInfoMatchService);
    }

    [Fact]
    public void GetScoreForMatchBySportType_IsCricket_ReturnsDefaultMatchesData()
    {
        // Act
        service.GetScoreForMatchBySportType(new List<Match>(), new List<ResultDetail>(), Core.Constants.SportType.Cricket, 10);

        // Assert
        matchResultDetailService.Received().CricketResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>());
    }

    [Fact]
    public void GetScoreForMatchBySportType_IsOtherSport_ReturnsDefaultMatchesData()
    {
        // Arrange
        var matches = new List<Match>
        {
            new Match { MatchId = 1 },
            new Match { MatchId = 2 }
        };

        // Act
        var newMatches = service.GetScoreForMatchBySportType(matches, new List<ResultDetail>(), 90, 11);

        // Assert
        Assert.Equal(matches.Count, newMatches.Count);
        Assert.Equal(11, newMatches[0].GroupSport);
    }

    [Fact]
    public void SetNewMatchInfo_ExistMatch_CallRelatedMethods()
    {
        var matches = new List<Match>
        {
            new()
            {
                MatchId = 100
            }
        };

        service.SetNewMatchInfo(matches);

        Received.InOrder(() =>
        {
            newInfoMatchService.TicketInfo(Arg.Is<Match>(item => item.MatchId == 100));
            newInfoMatchService.NewEventStatus(Arg.Is<Match>(item => item.MatchId == 100));
            newInfoMatchService.EventStatusColor(Arg.Is<Match>(item => item.MatchId == 100));
            newInfoMatchService.EarlySettlementStatus(Arg.Is<Match>(item => item.MatchId == 100));
        });
    }

    [Fact]
    public void MergeMatches_Always_InfoSiteMatch()
    {
        var baseMatches = new List<Match>
        {
            new () { MatchId = 123 }
        };

        var siteMatches = new List<Match>
        {
            new () { MatchId = 123 },
            new () {MatchId = 456}
        };

        compareMatchService.GetDifferentMatchSiteInfo(Arg.Any<Match>(), Arg.Any<List<Match>>())
            .Returns(new SiteMatch { IsCalculatingSingle = 1 });

        var listMatch = service.MergeMatches(baseMatches, siteMatches);

        Assert.Equal(2, listMatch.Count);
        Assert.Equal(1, listMatch[0].SiteMatch[0].IsCalculatingSingle);
    }
}