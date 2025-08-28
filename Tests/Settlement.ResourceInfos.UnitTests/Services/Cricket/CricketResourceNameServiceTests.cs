namespace Settlement.ResourceInfos.UnitTests.Services.Cricket;

using Constants;
using Settlement.ResourceInfos.Services.Cricket;

public class CricketResourceNameServiceTests
{
    [Theory]
    [InlineData("9400", "Super Over Winner", "9400")]
    [InlineData("9446", "Match Fours / Most Fours", "9446")]
    [InlineData("9453", "Highest Over Score", "9453")]
    [InlineData("96801001", "1st Inns Batsman Runs", "9680")]
    [InlineData("96622001", "2nd Inns Next Man Out", "9662")]
    [InlineData("96711001", "1st Inns Prematch Top Batsman", "9671")]
    [InlineData("94511", "Match Dot Ball", "9451")]
    [InlineData("97091", "1st Inns Highest Over Score", "9709")]
    [InlineData("94352003", "2nd Inns Wicket 3 Method of Dismissal (2-way)", "9435")]
    [InlineData("9490100203", "1st Inns Over 2 Ball 3 Exact Runs", "9490")]
    [InlineData("96372001", "2nd Inns Wicket 1 Method of Dismissal (6-way)", "9637")]
    [InlineData("96241002", "1st Inns Over 2 Has Boundary Four?", "9624")]
    [InlineData("A1", "Innings 1 Away", "A1")]
    [InlineData("H1", "Innings 1 Home", "H1")]
    [InlineData("00", ResourceNameConstants.MatchWinner, "00")]
    public void GroupBetTypesAndGenerateNames_Always_SetCorrectBetTypeInfo(string resourceId, string betTypeName, string betType)
    {
        var service = new CricketResourceNameService();
        var actual = service.GetResourceName(resourceId, 0);

        Assert.Equal(betType, actual.Item1);
        Assert.Equal(betTypeName, actual.Item2);
    }
}