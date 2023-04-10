using Settlement.Core.Models;
using Settlement.EventManagement.Services.MultiSports;
using Match = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.UnitTests.Services.MultiSports;

public class ExternalScoreServiceTests
{
    private readonly IExternalScoreService service;

    public ExternalScoreServiceTests()
    {
        service = new ExternalScoreServiceImp();
    }

    [Fact]
    public void LoadExternalResultForOtherSports_SportSupportFullTimeOnly_SetExResult()
    {
        var match = new Match
        {
            MatchId = 12345,
            SuspenderFullTime = "testing",
            FinalHomeScore = 1,
            FinalAwayScore = 2
        };
        var listResultDetail = new List<ResultDetail>
        {
            new() { MatchId = 12345, ResourceId = "01", HomeValue = "1", AwayValue = "1", SourceId = 1, SourceName = "SBO"},
            new() { MatchId = 12345, ResourceId = "00", HomeValue = "1", AwayValue = "2", SourceId = 1, SourceName = "SBO"}
        };

        service.LoadExternalResultForOtherSports(match, listResultDetail, false);

        Assert.Equal(listResultDetail[1], match.ExFtResult);
    }

    [Fact]
    public void LoadExternalResultForOtherSports_SportSupportFullTimeAndHalfTime_SetExResult()
    {
        var match = new Match
        {
            MatchId = 12345,
            SuspenderFullTime = "testing",
            FinalHomeScore = 1,
            FinalAwayScore = 2,
            HalfTimeHomeScore = 3,
            HalfTimeAwayScore = 4
        };
        var listResultDetail = new List<ResultDetail>
        {
            new() { MatchId = 12345, ResourceId = "01", HomeValue = "1", AwayValue = "1", SourceId = 1, SourceName = "SBO"},
            new() { MatchId = 12345, ResourceId = "00", HomeValue = "1", AwayValue = "2", SourceId = 1, SourceName = "SBO"}
        };

        service.LoadExternalResultForOtherSports(match, listResultDetail, true);

        Assert.Equal(listResultDetail[1], match.ExFtResult);
        Assert.Equal(listResultDetail[0], match.ExHtResult);
    }

    [Fact]
    public void LoadExternalResultForBeachVolleyball_ExternalResultIsNotNull__SetExScoreOfMatch()
    {
        var match = new Match
        {
            MatchId = 12345
        };
        var listResultDetail = new List<ResultDetail>
        {
            new() { MatchId = 12345, ResourceId = "00", HomeValue = "1", AwayValue = "2", SourceId = 1, SourceName = "SBO"}
        };

        // Act
        service.LoadExternalResultForVolleyball(match, listResultDetail);

        // Assert
        Assert.Equal(match.ExFtResult, listResultDetail[0]);
    }
}