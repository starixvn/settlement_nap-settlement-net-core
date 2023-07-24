using Settlement.Core.Models;
using Settlement.EventManagement.Services.MultiSports;

namespace Settlement.EventManagement.UnitTests.Services.MultiSports;

public class ExternalScoreServiceTests
{
    private readonly IExternalScoreService service;

    private const int MatchId = 1;

    private const string UserConfirmation = "sa";

    public ExternalScoreServiceTests()
    {
        service = new ExternalScoreServiceImp();
    }

    [Fact]
    public void IsInconsistentFullTimeScore_ExternalResultDetailIsNull_ReturnsFalse()
    {
        var listResultDetail = new List<ResultDetail>
        {
            new() { MatchId = MatchId, ResourceId = "00", HomeValue = "1", AwayValue = "1", SourceId = 0}
        };

        var actual = service.IsInconsistentFullTimeScore(MatchId, UserConfirmation, listResultDetail);

        Assert.False(actual);
    }

    [Fact]
    public void IsInconsistentFullTimeScore_IsExistedExternalResultDetailAndEmptyCurrentResultDetail_ReturnsTrue()
    {
        var listResultDetail = new List<ResultDetail>
        {
            new() { MatchId = MatchId, ResourceId = "00", HomeValue = "1", AwayValue = "2", SourceId = 1}
        };

        var actual = service.IsInconsistentFullTimeScore(MatchId, UserConfirmation, listResultDetail);

        Assert.True(actual);
    }

    [Fact]
    public void IsInconsistentFullTimeScore_IsExistedExternalAndCurrentResultDetailAndTheSameScore_ReturnsFalse()
    {
        var listResultDetail = new List<ResultDetail>
        {
            new() { MatchId = MatchId, ResourceId = "00", HomeValue = "1", AwayValue = "2", SourceId = 0},
            new() { MatchId = MatchId, ResourceId = "00", HomeValue = "1", AwayValue = "2", SourceId = 1}
        };

        var actual = service.IsInconsistentFullTimeScore(MatchId, UserConfirmation, listResultDetail);

        Assert.False(actual);
    }

    [Theory]
    [InlineData("2", "1", "-")]
    [InlineData("", "1", UserConfirmation)]
    public void IsInconsistentFullTimeScore_IsExistedExternalAndCurrentResultDetailAndDifferenceScore_ReturnsTrue(
        string currentScore, string externalScore, string userConfirmation)
    {
        var listResultDetail = new List<ResultDetail>
        {
            new() { MatchId = MatchId, ResourceId = "00", HomeValue = currentScore, AwayValue = currentScore, SourceId = 0},
            new() { MatchId = MatchId, ResourceId = "00", HomeValue = externalScore, AwayValue = externalScore, SourceId = 1}
        };

        var actual = service.IsInconsistentFullTimeScore(MatchId, userConfirmation, listResultDetail);

        Assert.True(actual);
    }

    [Fact]
    public void IsInconsistentHalftimeScore_ExternalResultDetailIsNull_ReturnsFalse()
    {
        var match = new Models.MultiSports.Match
        {
            MatchId = MatchId
        };
        var listResultDetail = new List<ResultDetail>
        {
            new() { MatchId = MatchId, ResourceId = "01", HomeValue = "1", AwayValue = "1", SourceId = 0}
        };

        var actual = service.IsInconsistentHalftimeScore(match, listResultDetail);

        Assert.False(actual);
    }

    [Theory]
    [InlineData(null, "1", UserConfirmation)]
    [InlineData(1, "2", "-")]
    public void IsInconsistentHalftimeScore_IsExistedExternalResultDetailAndScore_ReturnsTrue(
        int? score, string externalScore, string userConfirmation)
    {
        var match = new Models.MultiSports.Match
        {
            MatchId = MatchId,
            SuspenderHalfTime = userConfirmation,
            HalfTimeHomeScore = score,
            HalfTimeAwayScore = score
        };

        var listResultDetail = new List<ResultDetail>
        {
            new() { MatchId = MatchId, ResourceId = "01", HomeValue =externalScore, AwayValue = externalScore, SourceId = 1}
        };

        var actual = service.IsInconsistentHalftimeScore(match, listResultDetail);

        Assert.True(actual);
    }

    [Fact]
    public void IsInconsistentFullTimeScore_ExternalResultDetailIsNullAndExistedMatch_ReturnsFalse()
    {
        var match = new Models.MultiSports.Match
        {
            MatchId = MatchId
        };
        var listResultDetail = new List<ResultDetail>
        {
            new() { MatchId = MatchId, ResourceId = "00", HomeValue = "1", AwayValue = "1", SourceId = 0}
        };

        var actual = service.IsInconsistentFullTimeScore(match, listResultDetail);

        Assert.False(actual);
    }

    [Theory]
    [InlineData(null, "1", UserConfirmation)]
    [InlineData(1, "2", "-")]
    public void IsInconsistentFullTimeScore_IsExistedExternalResultDetailAndScore_ReturnsTrue(
        int? score, string externalScore, string userConfirmation)
    {
        var match = new Models.MultiSports.Match
        {
            MatchId = MatchId,
            SuspenderFullTime = userConfirmation,
            FinalHomeScore = score,
            FinalAwayScore = score
        };

        var listResultDetail = new List<ResultDetail>
        {
            new() { MatchId = MatchId, ResourceId = "00", HomeValue =externalScore, AwayValue = externalScore, SourceId = 1}
        };

        var actual = service.IsInconsistentFullTimeScore(match, listResultDetail);

        Assert.True(actual);
    }
}