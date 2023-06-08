using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Services;

namespace Settlement.EventManagement.UnitTests.Services;

public class ScoreServiceTests
{
	private readonly ScoreService service;

	private readonly IScoreSetService scoreSetService;

	public ScoreServiceTests()
	{
		scoreSetService = Substitute.For<IScoreSetService>();
		service = new ScoreServiceImp(scoreSetService);
	}

	private static List<ResultDetail> EmptyResultDetail => new();
	private static List<string> Resources => new() { "00", "01" };
	private readonly Permission permission = new();

	[Fact]
	public void ScoreOfSets_EmptyResultDetail_ReturnsHyphenOnAllQuarter()
	{
		// Arrange
		var expectedQuarter = new Score[2].Select(_ => new Score("-")).ToArray();

		// Act
		var actualQuarter = service.ScoreOfSets(EmptyResultDetail, Resources, permission);

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

		scoreSetService.GetScore(Arg.Any<ResultDetail>(), Arg.Any<Permission>()).Returns(fakeQuarterScore);

		// Act
		var actualQuarter = service.ScoreOfSets(resultDetail, Resources, permission);

		// Assert
		AssertExtension.AreEqual(expectedQuarter, actualQuarter);
	}

	[Fact]
	public void HalftimeScore_BeachVolleyballAndMatchIsRefund_ReturnsExpectedScore()
	{
		// Arrange
		var resultDetail = new List<ResultDetail>
		{
			new()
			{
				ResourceId = "00",
				SettlementStatusId = 1
			}
		};

		// Act
		var actualScore = service.HalftimeScore(SportType.BeachVolleyball, resultDetail, permission);

		// Assert
		var expectedScore = new Score(SetStatus.Refund);
		AssertExtension.AreEqual(expectedScore, actualScore);
	}

	[Fact]
	public void HalftimeScore_BeachVolleyballExistScoreAndMatchIsNotRefund_ReturnsExpectedScore()
	{
		// Arrange
		var resultDetail = new List<ResultDetail>
		{
			new()
			{
				ResourceId = "0001",
				HomeValue = "1",
				AwayValue = "2",
				SettlementStatusId = 0
			},
			new()
			{
				ResourceId = "0002",
				HomeValue = "3",
				AwayValue = "4",
				SettlementStatusId = 0
			}
		};

		var expectedScore = new Score("4", "6");

		scoreSetService.SumScore(Arg.Any<List<ResultDetail>>()).Returns(expectedScore);

		// Act
		var actualScore = service.HalftimeScore(SportType.BeachVolleyball, resultDetail, permission);

		// Assert
		AssertExtension.AreEqual(expectedScore, actualScore);
	}

	[Fact]
	public void HalftimeScore_BeachVolleyballEmptyScoreAndMatchIsNotRefund_ReturnsExpectedScore()
	{
		// Arrange
		var resultDetail = new List<ResultDetail>
		{
			new()
			{
				ResourceId = "0001",
				HomeValue = "",
				AwayValue = "",
				SettlementStatusId = 0
			},
			new()
			{
				ResourceId = "0002",
				HomeValue = "",
				AwayValue = "",
				SettlementStatusId = 0
			}
		};

		scoreSetService.SumScore(Arg.Any<List<ResultDetail>>()).Returns(new Score("-"));

		// Act
		var actualScore = service.HalftimeScore(SportType.BeachVolleyball, resultDetail, permission);

		// Assert
		var expectedScore = new Score("-");
		AssertExtension.AreEqual(expectedScore, actualScore);
	}

	[Fact]
	public void HalftimeScore_NonBeachVolleyballAndMatchSettled_ReturnsExpectedScore()
	{
		// Arrange
		var resultDetail = new List<ResultDetail>
		{
			new()
			{
				ResourceId = "0001",
				HomeValue = "1",
				AwayValue = "1",
				SettlementStatusId = 0,
				ResultStatusId = 5
			},
			new()
			{
				ResourceId = "0002",
				HomeValue = "2",
				AwayValue = "2",
				SettlementStatusId = 0
			}
		};

		var expectedScore = new Score("1", "1");
		scoreSetService.SumScore(Arg.Any<List<ResultDetail>>()).Returns(expectedScore);

		// Act
		var actualScore = service.HalftimeScore(SportType.Badminton, resultDetail, permission);

		// Assert
		AssertExtension.AreEqual(expectedScore, actualScore);
	}

	[Fact]
	public void HalftimeScore_NotResourceHalftimeOnResultDetail_ReturnsHyphenOnScore()
	{
		// Arrange
		var expectedScore = new Score("-", "-");

		// Act
		var actualScore = service.HalftimeScore(1, EmptyResultDetail, permission);

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
			new() { MatchId = 1 , ResourceId = "01" }
		};

		scoreSetService.GetScore(Arg.Any<ResultDetail>(), Arg.Any<Permission>()).Returns(fakeHalftimeScore);

		// Act
		var actualScore = service.HalftimeScore(1, resultDetail, permission);

		// Assert
		AssertExtension.AreEqual(expectedScore, actualScore);
	}

	[Fact]
	public void FinalScore_NotResourceFinalTimeOnResultDetail_ReturnsHyphenOnScore()
	{
		// Arrange
		var expectedScore = new Score("-");

		// Act
		var actualScore = service.FinalScore(EmptyResultDetail, permission);

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
			new() { MatchId = 1 , ResourceId = "00" }
		};

		scoreSetService.GetScore(Arg.Any<ResultDetail>(), Arg.Any<Permission>()).Returns(fakeFinalTimeScore);

		// Act
		var actualScore = service.FinalScore(resultDetail, permission);

		// Assert
		AssertExtension.AreEqual(expectedScore, actualScore);
	}

	[Fact]
	public void IsDisplayIntervalScore_ReturnsTrue_BasketballWithIntervalScores()
	{
		// Arrange
		var resultDetails = new List<ResultDetail>
		{
			new () { ResourceId = ResourceType.Halftime },
			new () { ResourceId = "Q1" },
			new () { ResourceId = "Q2" },
			new () { ResourceId = ResourceType.Final }
		};

		// Act
		var result = service.IsDisplayIntervalScore(SportType.BasketBall, resultDetails);

		// Assert
		Assert.True(result);
	}

	[Fact]
	public void IsDisplayIntervalScore_ReturnsFalse_BasketballWithoutIntervalScores()
	{
		// Arrange
		var resultDetails = new List<ResultDetail>
		{
			new() { ResourceId = ResourceType.Halftime },
			new () { ResourceId = ResourceType.Final }
		};

		// Act
		var result = service.IsDisplayIntervalScore(SportType.BasketBall, resultDetails);

		// Assert
		Assert.False(result);
	}

	[Fact]
	public void IsDisplayIntervalScore_ReturnsTrue_NonBasketballSportType()
	{
		// Arrange
		var resultDetails = new List<ResultDetail>
		{
			new() { ResourceId = "0101" },
			new() { ResourceId = ResourceType.Final }
		};

		// Act
		var result = service.IsDisplayIntervalScore(SportType.Tennis, resultDetails);

		// Assert
		Assert.True(result);
	}
}