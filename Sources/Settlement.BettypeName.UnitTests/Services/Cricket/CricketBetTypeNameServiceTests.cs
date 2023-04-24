using Settlement.BetTypeName.Services.Cricket;

namespace Settlement.BettypeName.UnitTests.Services.Cricket;

public class CricketBetTypeNameServiceTests
{
    [Theory]
    [InlineData("9400", "Super Over Winner")]
    [InlineData("9446", "Match Fours")]
    [InlineData("9453", "Highest Over Score")]
    [InlineData("96801001", "1st Inns Batsman Runs")]
    [InlineData("96622001", "2nd Inns Next Man Out")]
    [InlineData("96711001", "1st Inns Prematch Top Batsman")]
    [InlineData("94511", "Match Dot Ball")]
    [InlineData("97091", "1st Inns Highest Over Score")]
    [InlineData("94352003", "2nd Inns Wicket 3 Method of Dismissal (2-way)")]
    [InlineData("9490100203", "1st Inns Over 2 Ball 3 Exact Runs")]
    [InlineData("96372001", "2nd Inns Wicket 1 Method of Dismissal (6-way)")]
    [InlineData("96241002", "1st Inns Over 2 Has Boundary Four?")]
    public void GroupBetTypesAndGenerateNames_Always_SetCorrectBetTypeInfo(string resourceId, string betTypeName)
    {
        var service = new CricketBetTypeNameService();
        var actual = service.GetResourceName(resourceId);

        Assert.Equal(betTypeName, actual);
    }
}