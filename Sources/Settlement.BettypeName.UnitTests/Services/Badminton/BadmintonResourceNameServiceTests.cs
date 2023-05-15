using Settlement.ResourceInfos.Constants;
using Settlement.ResourceInfos.Services.Badminton;

namespace Settlement.BettypeName.UnitTests.Services.Badminton;

public class BadmintonResourceNameServiceTests
{
    [Theory]
    [InlineData("7120103", "Game 1 Race to 3 Points", "712")]
    [InlineData("7120203", "Game 2 Race to 3 Points", "712")]
    [InlineData("7130301", "Game 3 Point 1 Winner", "713")]
    [InlineData("0101", "Game 1", "0101")]
    [InlineData("00", ResourceNameConstants.Match, "00")]
    [InlineData("01", ResourceNameConstants.TotalPoints, "01")]
    public void GetBetTypeName_Always_ReturnCorrectBetTypeInfo(string resourceId, string betTypeName, string betType)
    {
        var service = new BadmintonResourceNameService();

        var actual = service.GetResourceName(resourceId, 0);

        Assert.Equal(betType, actual.Item1);
        Assert.Equal(betTypeName, actual.Item2);
    }
}