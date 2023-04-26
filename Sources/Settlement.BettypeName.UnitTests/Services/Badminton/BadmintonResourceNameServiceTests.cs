using Settlement.ResourceName.Constants;
using Settlement.ResourceName.Services.Badminton;

namespace Settlement.BettypeName.UnitTests.Services.Badminton;

public class BadmintonResourceNameServiceTests
{
    [Theory]
    [InlineData("7120103", "Game 1 Race to 3 Points")]
    [InlineData("7120203", "Game 2 Race to 3 Points")]
    [InlineData("7130301", "Game 3 Point 1 Winner")]
    [InlineData("0101", "Game 1")]
    [InlineData("00", ResourceNameConstants.Match)]
    [InlineData("01", ResourceNameConstants.TotalPoints)]
    public void GetBetTypeName_Always_ReturnCorrectBetTypeInfo(string resourceId, string betTypeName)
    {
        var service = new BadmintonResourceNameService();

        var actual = service.GetResourceName(resourceId);

        Assert.Equal(betTypeName, actual);
    }
}