using Newtonsoft.Json;
using Settlement.Core.Models;
using Settlement.Core.Services;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Services;

public class MatchResultDetailServiceTest
{
    private readonly IRefDataService refDataService;

    private readonly IScoreService scoreService;

    private readonly IMatchResultDetailService service;

    public MatchResultDetailServiceTest()
    {
        refDataService = Substitute.For<IRefDataService>();

        scoreService = Substitute.For<IScoreService>();

        service = new MatchResultDetailServiceImp(refDataService, scoreService);
    }

    [Fact]
    public void BadmintonResultDetail_EmptyMatch_ReturnsEmpty()
    {
        // Act
        var actual = service.CricketResultDetail(new List<Match>(), Arg.Any<List<ResultDetail>>());

        // Assert
        Assert.Empty(actual);
    }

    [Fact]
    public void BadmintonResultDetail_HasMatches_ReturnsExpectedMatch()
    {
        // Arrange
        var matches = new List<Match> {
            new() { MatchId = 1 }
        };

        var fakedScore = new MoreScores
        {
            HalfTimeScore = new Score("1", "2"),
            FinalScore = new Score("3", "4")
        };

        var resultDetail = new List<ResultDetail>();

        var expectedMatches = new List<Match>
        {
            new() { MatchId = 1, MoreScores = fakedScore, RefDataService = refDataService }
        };

        scoreService.ScoreLoader(Arg.Any<List<ResultDetail>>(), Arg.Any<List<string>>()).Returns(fakedScore);

        // Act
        var actualMatches = service.CricketResultDetail(matches, resultDetail);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expectedMatches), JsonConvert.SerializeObject(actualMatches));
    }
}