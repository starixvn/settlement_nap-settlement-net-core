using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;

namespace Settlement.ThirdPartyProducts.UnitTests.Services;

public class ScoreServiceTests
{
    private static List<ResultDetail> EmptyResultDetail => new List<ResultDetail>();

    [Fact]
    public void ScoreOfSets_EmptyResultDetail_ReturnsHyphenOnAllQuarter()
    {
        // Arrange
        var expectedQuarter = new Score[5].Select(n => new Score("-")).ToArray();
        var scoreSetService = Substitute.For<IScoreSetService>();
        var scoreService = new ScoreServiceImp(scoreSetService);

        // Act
        var actualQuarter = scoreService.ScoreOfSets(EmptyResultDetail, SportType.BasketBall, true);

        // Assert
        AssertExtension.AreEqual(expectedQuarter, actualQuarter);
    }

    [Fact]
    public void ScoreOfSets_HasResultDetail_ReturnsCorrectScoreGetFromScoreSetService()
    {
        // Arrange
        var resultDetail = new List<ResultDetail>
            {
                new ResultDetail { MatchId = 1 , ResourceId = "Q1" },
                new ResultDetail { MatchId = 1 , ResourceId = "Q2" },
                new ResultDetail { MatchId = 1 , ResourceId = "Q3" },
                new ResultDetail { MatchId = 1 , ResourceId = "Q4" },
                new ResultDetail { MatchId = 1 , ResourceId = "OT" },
                new ResultDetail { MatchId = 1 , ResourceId = "00" },
                new ResultDetail { MatchId = 1 , ResourceId = "01" }
            };

        var fakeQuarterScore = new Score("1", "2");
        var expectedQuarter = new Score[5].Select(n => new Score("1", "2")).ToArray();
        var scoreSetService = Substitute.For<IScoreSetService>();
        var scoreService = new ScoreServiceImp(scoreSetService);

        scoreSetService.GetScore(Arg.Any<ResultDetail>(), Arg.Any<Permission>()).Returns(fakeQuarterScore);

        // Act
        var actualQuarter = scoreService.ScoreOfSets(resultDetail, SportType.BasketBall, true);

        // Assert
        AssertExtension.AreEqual(expectedQuarter, actualQuarter);
    }

    [Fact]
    public void HalftimeScore_NotResourceHalftimeOnResultDetail_ReturnsHyphenOnScore()
    {
        // Arrange
        var expectedScore = new Score("-", "-");
        var scoreSetService = Substitute.For<IScoreSetService>();
        var scoreService = new ScoreServiceImp(scoreSetService);
        const int sportType = SportType.BasketBall;

        // Act
        var actualScore = scoreService.HalftimeScore(EmptyResultDetail, sportType);

        // Assert
        AssertExtension.AreEqual(expectedScore, actualScore);
    }

    [Fact]
    public void HalftimeScore_HasResourceHalftimeOnResultDetail_ReturnsCorrectScoreGetFromScoreSetService()
    {
        // Arrange
        var fakeHalftimeScore = new Score("1", "2");
        var expectedScore = new Score("1", "2");
        var resultDetail = new List<ResultDetail>
            {
                new ResultDetail { MatchId = 1 , ResourceId = "01" }
            };

        var scoreSetService = Substitute.For<IScoreSetService>();
        var scoreService = new ScoreServiceImp(scoreSetService);
        const int sportType = SportType.BasketBall;
        scoreSetService.GetScore(Arg.Any<ResultDetail>(), Arg.Any<Permission>()).Returns(fakeHalftimeScore);

        // Act
        var actualScore = scoreService.HalftimeScore(resultDetail, sportType);

        // Assert
        AssertExtension.AreEqual(expectedScore, actualScore);
    }

    [Fact]
    public void FinalScore_NotResourceFinalTimeOnResultDetail_ReturnsHyphenOnScore()
    {
        // Arrange
        var expectedScore = new Score("-");
        var scoreSetService = Substitute.For<IScoreSetService>();
        var scoreService = new ScoreServiceImp(scoreSetService);
        const int sportType = SportType.BasketBall;

        // Act
        var actualScore = scoreService.FinalScore(EmptyResultDetail, sportType);

        // Assert
        AssertExtension.AreEqual(expectedScore, actualScore);
    }

    [Fact]
    public void FinalScore_HasFinalTimeScoreOnResultDetail_ReturnsCorrectScoreGetFromScoreSetService()
    {
        // Arrange
        var fakeFinalTimeScore = new Score("5", "7");
        var expectedScore = new Score("5", "7");

        var resultDetail = new List<ResultDetail>
            {
                new ResultDetail { MatchId = 1 , ResourceId = "00" }
            };
        var scoreSetService = Substitute.For<IScoreSetService>();
        var scoreService = new ScoreServiceImp(scoreSetService);
        const int sportType = SportType.BasketBall;
        scoreSetService.GetScore(Arg.Any<ResultDetail>(), Arg.Any<Permission>()).Returns(fakeFinalTimeScore);

        // Act
        var actualScore = scoreService.FinalScore(resultDetail, sportType);

        // Assert
        AssertExtension.AreEqual(expectedScore, actualScore);
    }
}