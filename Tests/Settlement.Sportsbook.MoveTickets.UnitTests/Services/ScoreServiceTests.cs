using Newtonsoft.Json;
using Settlement.Models;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Services;

public class ScoreServiceTests
{
    private readonly IScoreSetService scoreSetService;

    private readonly IScoreService service;

    private static List<ResultDetail> EmptyResultDetail => [];
    private static List<string> Resources => ["00", "01"];

    public ScoreServiceTests()
    {
        scoreSetService = Substitute.For<IScoreSetService>();
        service = new ScoreServiceImp(scoreSetService);
    }

    [Fact]
    public void ScoreOfSets_EmptyResultDetail_ReturnsHyphenOnAllQuarter()
    {
        // Arrange
        var expectedQuarter = new Score[2].Select(_ => new Score("-")).ToArray();

        // Act
        var actualQuarter = service.ScoreOfSets(EmptyResultDetail, Resources);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expectedQuarter), JsonConvert.SerializeObject(actualQuarter));
    }

    [Fact]
    public void ScoreOfSets_HasResultDetail_ReturnsCorrectScoreGetFromScoreSetService()
    {
        // Arrange
        var resultDetail = new List<ResultDetail>
        {
            new() { MatchId = 1 , ResourceId = "00" },
            new() { MatchId = 1 , ResourceId = "01" }
        };

        var fakeQuarterScore = new Score("1", "2");
        var expectedQuarter = new Score[2].Select(_ => new Score("1", "2")).ToArray();

        scoreSetService.GetScore(Arg.Any<ResultDetail>()).Returns(fakeQuarterScore);

        // Act
        var actualQuarter = service.ScoreOfSets(resultDetail, Resources);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expectedQuarter), JsonConvert.SerializeObject(actualQuarter));
    }

    [Fact]
    public void HalftimeScore_NotResourceHalftimeOnResultDetail_ReturnsHyphenOnScore()
    {
        // Arrange
        var expectedScore = new Score("-", "-");

        // Act
        var actualScore = service.HalftimeScore(EmptyResultDetail);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expectedScore), JsonConvert.SerializeObject(actualScore));
    }

    [Fact]
    public void HalftimeScore_HasResourceHalftimeOnResultDetail_ReturnsCorrectScoreGetFromScoreSetService()
    {
        // Arrange
        var fakeHalftimeScore = new Score("1", "2");
        var expectedScore = new Score("1", "2");
        var resultDetail = new List<ResultDetail>
        {
            new() { MatchId = 1 , ResourceId = "01" }
        };

        scoreSetService.GetScore(Arg.Any<ResultDetail>()).Returns(fakeHalftimeScore);

        // Act
        var actualScore = service.HalftimeScore(resultDetail);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expectedScore), JsonConvert.SerializeObject(actualScore));
    }

    [Fact]
    public void FinalScore_NotResourceFinalTimeOnResultDetail_ReturnsHyphenOnScore()
    {
        // Arrange
        var expectedScore = new Score("-");

        // Act
        var actualScore = service.FinalScore(EmptyResultDetail);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expectedScore), JsonConvert.SerializeObject(actualScore));
    }

    [Fact]
    public void FinalScore_HasFinalTimeScoreOnResultDetail_ReturnsCorrectScoreGetFromScoreSetService()
    {
        // Arrange
        var fakeFinalTimeScore = new Score("5", "7");
        var expectedScore = new Score("5", "7");

        var resultDetail = new List<ResultDetail>
        {
            new() { MatchId = 1 , ResourceId = "00" }
        };

        scoreSetService.GetScore(Arg.Any<ResultDetail>()).Returns(fakeFinalTimeScore);

        // Act
        var actualScore = service.FinalScore(resultDetail);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expectedScore), JsonConvert.SerializeObject(actualScore));
    }

    [Fact]
    public void ScoreLoader_ReturnsScoreCricket()
    {
        // Arrange
        var resources = new List<string> { "H1", "H2", "A1", "A2" };
        var fakeHalftimeScore = new Score("-", "-");
        var fakeFinalTimeScore = new Score("1", "2");
        var fakeQuarterScore = new Score[4].Select(_ => new Score("-", "-")).ToArray();
        var expectedScore = new MoreScores
        {
            HalfTimeScore = fakeHalftimeScore,
            FinalScore = fakeFinalTimeScore,
            Sets = fakeQuarterScore
        };

        var resultDetails = new List<ResultDetail>
        {
            new() { ResourceId =  "00", MatchId = 1 }
        };

        scoreSetService.GetScore(Arg.Any<ResultDetail>()).Returns(fakeFinalTimeScore);

        // Act
        var actualScore = service.ScoreLoader(resultDetails, resources);

        // Assert
        Assert.Equal(JsonConvert.SerializeObject(expectedScore), JsonConvert.SerializeObject(actualScore));
    }
}