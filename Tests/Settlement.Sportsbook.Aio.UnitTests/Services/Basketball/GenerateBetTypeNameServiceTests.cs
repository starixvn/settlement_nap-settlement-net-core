using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Basketball;

public class GenerateBetTypeNameServiceTests
{
    private readonly IGenerateBetTypeNameService service;
    private readonly IRefDataService refDataService;

    public GenerateBetTypeNameServiceTests()
    {
        refDataService = Substitute.For<IRefDataService>();
        service = new GenerateBetTypeNameService(refDataService);
    }

    [Fact]
    public void GenerateBetTypeName_SinglePlayerType_ReturnsPlayerReplacedBetTypeName()
    {
        // Arrange
        var resultDetail = new ResultDetail
        {
            BetType = "653", // SinglePlayerType
            BetTypeName = "player Points Over/Under",
            OddFlex = new List<OddFlexModel>
            {
                new()
                {
                    Info = new OddsInfoModel
                    {
                        PlayerName = "LeBron James",
                        TeamId = 1111
                    }
                }
            }
        };

        // Act
        var result = service.GenerateBetTypeName(resultDetail);

        // Assert
        Assert.Equal("LeBron James Points Over/Under", result);
    }

    [Fact]
    public void GenerateBetTypeName_SinglePlayerType_NoOddFlex_ReturnsBetTypeName()
    {
        // Arrange
        var resultDetail = new ResultDetail
        {
            BetType = "653", // SinglePlayerType
            BetTypeName = "Player Points Over/Under",
            OddFlex = new List<OddFlexModel>()
        };

        // Act
        var result = service.GenerateBetTypeName(resultDetail);

        // Assert
        Assert.Equal("Player Points Over/Under", result);
    }

    [Fact]
    public void GenerateBetTypeName_SpecialPerformanceType_ReturnsPlayerReplacedBetTypeName()
    {
        // Arrange
        var resultDetail = new ResultDetail
        {
            BetType = "677", // SpecialPerformanceType
            BetTypeName = "player Triple Double",
            OddFlex = new List<OddFlexModel>
            {
                new()
                {
                    Info = new OddsInfoModel
                    {
                        PlayerName = "Stephen Curry",
                        TeamId = 1111
                    }
                }
            }
        };

        // Act
        var result = service.GenerateBetTypeName(resultDetail);

        // Assert
        Assert.Equal("Stephen Curry Triple Double", result);
    }

    [Fact]
    public void GenerateBetTypeName_PerformanceType_WithStatisticsAndResults_ReturnsFormattedString()
    {
        // Arrange
        refDataService.GetTeamName(1111).Returns("Lakers");

        var resultDetail = new ResultDetail
        {
            BetType = "675", // PerformanceType
            BetTypeName = "Player Performance",
            OddFlex = new List<OddFlexModel>
            {
                new()
                {
                    Info = new OddsInfoModel
                    {
                        PlayerName = "LeBron James",
                        TeamId = 1111,
                        Statistics = new List<Statistic>
                        {
                            new() { Type = "points", Value = "25+" },
                            new() { Type = "assists", Value = "8+" }
                        },
                        Results = new List<ResultInfo>
                        {
                            new() { Type = "winner", Value = "1111" }
                        }
                    }
                }
            }
        };

        // Act
        var result = service.GenerateBetTypeName(resultDetail);

        // Assert
        Assert.Equal("LeBron James have 25+ points, 8+ assists and Lakers to Win", result);
    }

    [Fact]
    public void GenerateBetTypeName_PerformanceType_NoOddFlex_ReturnsBetTypeName()
    {
        // Arrange
        var resultDetail = new ResultDetail
        {
            BetType = "675", // PerformanceType
            BetTypeName = "Player Performance",
            OddFlex = new List<OddFlexModel>()
        };

        // Act
        var result = service.GenerateBetTypeName(resultDetail);

        // Assert
        Assert.Equal("Player Performance", result);
    }

    [Fact]
    public void GenerateBetTypeName_MostPointsType_TwoPlayers_ReturnsVersusFormat()
    {
        // Arrange
        var resultDetail = new ResultDetail
        {
            BetType = "680", // MostPointsType
            BetTypeName = "Most Points",
            OddFlex = new List<OddFlexModel>
            {
                new()
                {
                    Info = new OddsInfoModel
                    {
                        PlayerName = "LeBron James",
                        TeamId = 1111
                    }
                },
                new()
                {
                    Info = new OddsInfoModel
                    {
                        PlayerName = "Stephen Curry",
                        TeamId = 2222
                    }
                }
            }
        };

        // Act
        var result = service.GenerateBetTypeName(resultDetail);

        // Assert
        Assert.Equal("Most Points - LeBron James vs. Stephen Curry", result);
    }

    [Fact]
    public void GenerateBetTypeName_MostPointsType_NotTwoPlayers_ReturnsBetTypeName()
    {
        // Arrange
        var resultDetail = new ResultDetail
        {
            BetType = "680", // MostPointsType
            BetTypeName = "Most Points",
            OddFlex = new List<OddFlexModel>
            {
                new()
                {
                    Info = new OddsInfoModel
                    {
                        PlayerName = "LeBron James",
                        TeamId = 1111
                    }
                }
            }
        };

        // Act
        var result = service.GenerateBetTypeName(resultDetail);

        // Assert
        Assert.Equal("Most Points", result);
    }

    [Fact]
    public void GenerateBetTypeName_UnknownBetType_ReturnsBetTypeName()
    {
        // Arrange
        var resultDetail = new ResultDetail
        {
            BetType = "999", // Unknown bet type
            BetTypeName = "Unknown Bet Type"
        };

        // Act
        var result = service.GenerateBetTypeName(resultDetail);

        // Assert
        Assert.Equal("Unknown Bet Type", result);
    }

    [Fact]
    public void GenerateBetTypeName_ThreePointStatistic_ReturnsFormattedWithFieldGoals()
    {
        // Arrange
        refDataService.GetTeamName(1111).Returns("Lakers");

        var resultDetail = new ResultDetail
        {
            BetType = "675", // PerformanceType
            BetTypeName = "Player Performance",
            OddFlex = new List<OddFlexModel>
            {
                new()
                {
                    Info = new OddsInfoModel
                    {
                        PlayerName = "Stephen Curry",
                        TeamId = 1111,
                        Statistics = new List<Statistic>
                        {
                            new() { Type = "three point", Value = "5+" }
                        },
                        Results = new List<ResultInfo>
                        {
                            new() { Type = "winner", Value = "1111" }
                        }
                    }
                }
            }
        };

        // Act
        var result = service.GenerateBetTypeName(resultDetail);

        // Assert
        Assert.Equal("Stephen Curry have 5+ three point field goals and Lakers to Win", result);
    }

    [Fact]
    public void GenerateBetTypeName_MultipleStatisticsAndResults_ReturnsProperlyFormattedString()
    {
        // Arrange
        refDataService.GetTeamName(1111).Returns("Lakers");

        var resultDetail = new ResultDetail
        {
            BetType = "675", // PerformanceType
            BetTypeName = "Player Performance",
            OddFlex = new List<OddFlexModel>
            {
                new()
                {
                    Info = new OddsInfoModel
                    {
                        PlayerName = "LeBron James",
                        TeamId = 1111,
                        Statistics = new List<Statistic>
                        {
                            new() { Type = "points", Value = "25+" },
                            new() { Type = "assists", Value = "8+" },
                            new() { Type = "rebounds", Value = "10+" }
                        },
                        Results = new List<ResultInfo>
                        {
                            new() { Type = "winner", Value = "1111" },
                            new() { Type = "over", Value = "85.5" }
                        }
                    }
                }
            }
        };

        // Act
        var result = service.GenerateBetTypeName(resultDetail);

        // Assert
        Assert.Equal("LeBron James have 25+ points, 8+ assists, 10+ rebounds, Lakers to Win and Lakers Total Points Over 85.5", result);
    }

    [Fact]
    public void GenerateBetTypeName_HandicapResult_ReturnsFormattedWithHandicap()
    {
        // Arrange
        refDataService.GetTeamName(1111).Returns("Lakers");

        var resultDetail = new ResultDetail
        {
            BetType = "675", // PerformanceType
            BetTypeName = "Player Performance",
            OddFlex = new List<OddFlexModel>
            {
                new()
                {
                    Info = new OddsInfoModel
                    {
                        PlayerName = "LeBron James",
                        TeamId = 1111,
                        Statistics = new List<Statistic>
                        {
                            new() { Type = "points", Value = "20+" }
                        },
                        Results = new List<ResultInfo>
                        {
                            new() { Type = "handicap", Value = "-5.5" }
                        }
                    }
                }
            }
        };

        // Act
        var result = service.GenerateBetTypeName(resultDetail);

        // Assert
        Assert.Equal("LeBron James have 20+ points and Lakers to win with Handicap (-5.5)", result);
    }

    [Fact]
    public void GenerateBetTypeName_EmptyStatisticsAndResults_ReturnsOnlyPlayerName()
    {
        // Arrange
        var resultDetail = new ResultDetail
        {
            BetType = "675", // PerformanceType
            BetTypeName = "Player Performance",
            OddFlex = new List<OddFlexModel>
            {
                new()
                {
                    Info = new OddsInfoModel
                    {
                        PlayerName = "LeBron James",
                        TeamId = 1111,
                        Statistics = new List<Statistic>(),
                        Results = new List<ResultInfo>()
                    }
                }
            }
        };

        // Act
        var result = service.GenerateBetTypeName(resultDetail);

        // Assert
        Assert.Equal("LeBron James have ", result);
    }

    [Fact]
    public void GenerateBetTypeName_NullStatisticsAndResults_ReturnsOnlyPlayerName()
    {
        // Arrange
        var resultDetail = new ResultDetail
        {
            BetType = "675", // PerformanceType
            BetTypeName = "Player Performance",
            OddFlex = new List<OddFlexModel>
            {
                new()
                {
                    Info = new OddsInfoModel
                    {
                        PlayerName = "LeBron James",
                        TeamId = 1111,
                        Statistics = null,
                        Results = null
                    }
                }
            }
        };

        // Act
        var result = service.GenerateBetTypeName(resultDetail);

        // Assert
        Assert.Equal("LeBron James have ", result);
    }

    [Fact]
    public void GenerateBetTypeName_StatisticsWithEmptyValues_FiltersOutEmptyValues()
    {
        // Arrange
        refDataService.GetTeamName(1111).Returns("Lakers");

        var resultDetail = new ResultDetail
        {
            BetType = "675", // PerformanceType
            BetTypeName = "Player Performance",
            OddFlex = new List<OddFlexModel>
            {
                new()
                {
                    Info = new OddsInfoModel
                    {
                        PlayerName = "LeBron James",
                        TeamId = 1111,
                        Statistics = new List<Statistic>
                        {
                            new() { Type = "points", Value = "25+" },
                            new() { Type = "", Value = "invalid" }, // Should be filtered out
                            new() { Type = "assists", Value = "" }, // Should be filtered out
                            new() { Type = "rebounds", Value = "10+" }
                        },
                        Results = new List<ResultInfo>
                        {
                            new() { Type = "winner", Value = "1111" }
                        }
                    }
                }
            }
        };

        // Act
        var result = service.GenerateBetTypeName(resultDetail);

        // Assert
        Assert.Equal("LeBron James have 25+ points, 10+ rebounds and Lakers to Win", result);
    }

    [Fact]
    public void GenerateBetTypeName_ResultsWithEmptyValues_FiltersOutEmptyValues()
    {
        // Arrange
        refDataService.GetTeamName(1111).Returns("Lakers");

        var resultDetail = new ResultDetail
        {
            BetType = "675", // PerformanceType
            BetTypeName = "Player Performance",
            OddFlex = new List<OddFlexModel>
            {
                new()
                {
                    Info = new OddsInfoModel
                    {
                        PlayerName = "LeBron James",
                        TeamId = 1111,
                        Statistics = new List<Statistic>
                        {
                            new() { Type = "points", Value = "25+" }
                        },
                        Results = new List<ResultInfo>
                        {
                            new() { Type = "winner", Value = "1111" },
                            new() { Type = "", Value = "invalid" }, // Should be filtered out
                            new() { Type = "over", Value = "" }, // Should be filtered out
                        }
                    }
                }
            }
        };

        // Act
        var result = service.GenerateBetTypeName(resultDetail);

        // Assert
        Assert.Equal("LeBron James have 25+ points and Lakers to Win", result);
    }

    [Fact]
    public void GenerateBetTypeName_SingleStatistic_ReturnsWithoutComma()
    {
        // Arrange
        var resultDetail = new ResultDetail
        {
            BetType = "675", // PerformanceType
            BetTypeName = "Player Performance",
            OddFlex = new List<OddFlexModel>
            {
                new()
                {
                    Info = new OddsInfoModel
                    {
                        PlayerName = "LeBron James",
                        TeamId = 1111,
                        Statistics = new List<Statistic>
                        {
                            new() { Type = "points", Value = "25+" }
                        },
                        Results = new List<ResultInfo>()
                    }
                }
            }
        };

        // Act
        var result = service.GenerateBetTypeName(resultDetail);

        // Assert
        Assert.Equal("LeBron James have 25+ points", result);
    }

    [Fact]
    public void GenerateBetTypeName_UnknownResultType_ReturnsFormattedWithTypeAndValue()
    {
        // Arrange
        refDataService.GetTeamName(1111).Returns("Lakers");

        var resultDetail = new ResultDetail
        {
            BetType = "675", // PerformanceType
            BetTypeName = "Player Performance",
            OddFlex = new List<OddFlexModel>
            {
                new()
                {
                    Info = new OddsInfoModel
                    {
                        PlayerName = "LeBron James",
                        TeamId = 1111,
                        Statistics = new List<Statistic>(),
                        Results = new List<ResultInfo>
                        {
                            new() { Type = "unknown", Value = "somevalue" }
                        }
                    }
                }
            }
        };

        // Act
        var result = service.GenerateBetTypeName(resultDetail);

        // Assert
        Assert.Equal("LeBron James have somevalue unknown", result);
    }
}
