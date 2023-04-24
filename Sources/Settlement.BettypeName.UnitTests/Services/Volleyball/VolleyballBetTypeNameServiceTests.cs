using Settlement.BetTypeName.Services.Volleyball;

namespace Settlement.BettypeName.UnitTests.Services.Volleyball;

public class VolleyballBetTypeNameServiceTests
{
    [Theory]
    [InlineData("3901", "First Serve")]
    [InlineData("3914", "Will there be a 5th Set?")]
    [InlineData("39030102", "Set 1 Race to 2 Points")]
    [InlineData("39090203", "Set 2 Point 3 Winner")]
    [InlineData("39150304", "Set 3 4 Points Played")]
    [InlineData("12345", "")]
    public void GetInnsBetTypeName_Always_ReturnCorrectBetTypeName(string resourceId, string betTypeName)
    {
        var service = new VolleyballBetTypeNameService();
        var actual = service.GetResourceName(resourceId);

        Assert.Equal(betTypeName, actual);
    }
}