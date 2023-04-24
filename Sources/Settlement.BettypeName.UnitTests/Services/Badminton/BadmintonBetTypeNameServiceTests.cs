using Settlement.BetTypeName.Services.Badminton;

namespace Settlement.BettypeName.UnitTests.Services.Badminton;

public class BadmintonBetTypeNameServiceTests
{
    [Theory]
    [InlineData("7120103", "Game 1 Race to 3 Points")]
    [InlineData("7120203", "Game 2 Race to 3 Points")]
    [InlineData("7130301", "Game 3 Point 1 Winner")]
    public void GetBetTypeName_Always_ReturnCorrectBetTypeInfo(string resourceId, string betTypeName)
    {
        var service = new BadmintonBetTypeNameService();

        var actual = service.GetResourceName(resourceId);

        Assert.Equal(betTypeName, actual);
    }
}