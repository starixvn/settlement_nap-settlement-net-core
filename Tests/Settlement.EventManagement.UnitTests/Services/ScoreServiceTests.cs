using AutoFixture;
using Settlement.Constants;
using Settlement.Models;
using Settlement.Services;
using Settlement.EventManagement.Services;

namespace Settlement.EventManagement.UnitTests.Services;

public class ScoreServiceTests
{
    private readonly ScoreService service;

    private readonly IScoreSetService scoreSetService;

    public ScoreServiceTests()
    {
        scoreSetService = Substitute.For<IScoreSetService>();
        isLeader = false;
        service = new ScoreServiceImp(scoreSetService);
    }

    private static List<ResultDetail> EmptyResultDetail => [];
    private static List<string> Resources => ["00", "01"];
    private readonly bool isLeader;

    [Fact]
    public void IsIntervalScore_SportIsBasketBallAndResourceIdIsExistedHalftimeFullTime_ReturnFalse()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>
        {
            new()
            {
                MatchId = 1,
                ResourceId = "01"
            },
            new ()
            {
                MatchId = 1,
                ResourceId = "00"
            }
        };

        // Act
        var actual = service.IsIntervalScore(SportType.BasketBall, resultDetails);

        // Assert
        Assert.False(actual);
    }

    [Fact]
    public void IsIntervalScore_IsOtherSportAndResourceIdIsExistedHalftimeFullTime_ReturnTrue()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>
        {
            new()
            {
                MatchId = 1,
                ResourceId = "01"
            },
            new ()
            {
                MatchId = 1,
                ResourceId = "00"
            }
        };

        // Act
        var actual = service.IsIntervalScore(SportType.OtherSports, resultDetails);

        // Assert
        Assert.True(actual);
    }

    [Fact]
    public void ScoreOfSets_EmptyResultDetail_ReturnsHyphenOnAllQuarter()
    {
        // Arrange
        var expectedQuarter = new Score[2].Select(_ => new Score("-")).ToArray();

        // Act
        var actualQuarter = service.ScoreOfSets(EmptyResultDetail, Resources, isLeader);

        // Assert
        AssertExtension.AreEqual(expectedQuarter, actualQuarter);
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

        scoreSetService.GetScore(Arg.Any<ResultDetail>(), Arg.Any<bool>()).Returns(fakeQuarterScore);

        // Act
        var actualQuarter = service.ScoreOfSets(resultDetail, Resources, isLeader);

        // Assert
        AssertExtension.AreEqual(expectedQuarter, actualQuarter);
    }

    [Fact]
    public void HalftimeScore_SportHaveTotalPointAndMatchIsNotRefund_ReturnsExpectedScore()
    {
        // Arrange
        var fixture = new Fixture();
        var resultDetail = fixture.CreateMany<ResultDetail>(4).ToList();

        scoreSetService.SumScore(Arg.Any<List<ResultDetail>>()).Returns(new Score("1", "1"));

        // Act
        var actualScore = service.HalftimeScore(SportType.Badminton, resultDetail, isLeader);

        // Assert
        var expectedScore = new Score("1", "1");
        AssertExtension.AreEqual(expectedScore, actualScore);
    }

    [Fact]
    public void HalftimeScore_SportWasRefundSDT_ReturnsExpectedScore()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>
        {
            new() { MatchId = 1 , SettlementStatusId = SettlementStatus.Abandoned, ResourceId =  Settlement.Constants.Resources.ResultHaftTime[SportGroup.SupportSettleDetermine[0]][0] },
            new() { MatchId = 1 , ResourceId = "01" ,HomeValue = "1" , AwayValue = "1"}
        };

        // Act
        service.HalftimeScore(SportGroup.SupportSettleDetermine[0], resultDetails, isLeader);

        // Assert
        scoreSetService.Received().GetScore(Arg.Is<ResultDetail>(r => r.HomeValue == null && r.AwayValue == string.Empty), isLeader);
    }

    [Fact]
    public void HalftimeScore_SportHaveTotalPointAndMatchIsRefund_ReturnsExpectedScore()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>
        {
            new ()
            {
                MatchId = 1,
                ResourceId = "00",
                SettlementStatusId = SettlementStatus.Refund
            }
        };
        // Act
        var actualScore = service.HalftimeScore(SportType.Badminton, resultDetails, isLeader);

        // Assert
        var expectedScore = new Score("R", "R");
        AssertExtension.AreEqual(expectedScore, actualScore);
    }

    [Fact]
    public void HalftimeScore_SportHaveNotTotalPointAndEmptyResultDetail_ReturnsEmptyScore()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>();

        // Act
        var actualScore = service.HalftimeScore(SportType.OtherSports, resultDetails, isLeader);

        // Assert
        var expectedScore = new Score("-");
        AssertExtension.AreEqual(expectedScore, actualScore);
    }

    [Fact]
    public void HalftimeScore_SportHaveNotTotalPointAndResultDetail_ReturnsExpectedScore()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>
        {
            new ()
            {
                MatchId = 1,
                ResourceId = "01",
                SettlementStatusId = SettlementStatus.Refund
            }
        };

        scoreSetService.GetScore(Arg.Any<ResultDetail>(), Arg.Any<bool>()).Returns(new Score("1", "1"));

        // Act
        var actualScore = service.HalftimeScore(SportType.OtherSports, resultDetails, isLeader);

        // Assert
        var expectedScore = new Score("1", "1");
        AssertExtension.AreEqual(expectedScore, actualScore);
    }

    [Fact]
    public void FinalScore_NotResourceFinalTimeOnResultDetail_ReturnsHyphenOnScore()
    {
        // Arrange
        var expectedScore = new Score("-");

        // Act
        var actualScore = service.FinalScore(1, EmptyResultDetail, isLeader);

        // Assert
        AssertExtension.AreEqual(expectedScore, actualScore);
    }

    [Fact]
    public void FinalScore_SportWasRefundSDT_ReturnsExpectedScore()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>
        {
            new() { MatchId = 1 , SettlementStatusId = SettlementStatus.Abandoned, ResourceId =  Settlement.Constants.Resources.ResultFullTime[SportGroup.SupportSettleDetermine[0]][0] },
            new() { MatchId = 1 , ResourceId = "00" ,HomeValue = "1" , AwayValue = "1"}
        };

        // Act
        service.FinalScore(SportGroup.SupportSettleDetermine[0], resultDetails, isLeader);

        // Assert
        scoreSetService.Received().GetScore(Arg.Is<ResultDetail>(r => r.HomeValue == null && r.AwayValue == string.Empty), isLeader);
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

        scoreSetService.GetScore(Arg.Any<ResultDetail>(), Arg.Any<bool>()).Returns(fakeFinalTimeScore);

        // Act
        var actualScore = service.FinalScore(1, resultDetail, isLeader);

        // Assert
        AssertExtension.AreEqual(expectedScore, actualScore);
    }
}