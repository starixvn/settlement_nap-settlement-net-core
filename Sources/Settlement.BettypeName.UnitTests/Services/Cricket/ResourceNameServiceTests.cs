using Settlement.ResourceName.Services.Cricket;

namespace Settlement.BettypeName.UnitTests.Services.Cricket;

public class ResourceNameServiceTests
{
    private readonly IResourceNameService service;

    public ResourceNameServiceTests()
    {
        service = new ResourceNameService();
    }

    [Theory]
    [InlineData("96801001", 9680, "1st Inns Batsman Runs")]
    [InlineData("96622001", 9662, "2nd Inns Next Man Out")]
    [InlineData("96711001", 9671, "1st Inns Prematch Top Batsman")]
    [InlineData("94511", 9451, "Match Dot Ball")]
    [InlineData("97091", 9709, "1st Inns Highest Over Score")]
    [InlineData("94352003", 9435, "2nd Inns Wicket 3 Method of Dismissal (2-way)")]
    [InlineData("9490100203", 9490, "1st Inns Over 2 Ball 3 Exact Runs")]
    [InlineData("96372001", 9637, "2nd Inns Wicket 1 Method of Dismissal (6-way)")]
    [InlineData("96241002", 9624, "1st Inns Over 2 Has Boundary Four?")]
    public void GetInnsBetTypeName_Always_ReturnCorrectBetTypeName(string resourceId, int betTypeId, string betTypeName)
    {
        var actual = service.GetInnsBetTypeName(betTypeId, resourceId);

        Assert.Equal(betTypeName, actual);
    }

    [Theory]
    [InlineData(9400, "Super Over Winner")]
    [InlineData(9446, "Match Fours")]
    [InlineData(9453, "Highest Over Score")]
    public void GetNonInnsBetTypeName_Always_ReturnCorrectBetTypeName(int betTypeId, string betTypeName)
    {
        var actual = service.GetNonInnsBetTypeName(betTypeId);

        Assert.Equal(betTypeName, actual);
    }
}