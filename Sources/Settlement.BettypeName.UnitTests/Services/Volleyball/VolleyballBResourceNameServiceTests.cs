using Settlement.ResourceName.Constants;
using Settlement.ResourceName.Services.Volleyball;

namespace Settlement.BettypeName.UnitTests.Services.Volleyball;

public class VolleyballBResourceNameServiceTests
{
    [Theory]
    [InlineData("00", ResourceNameConstants.Match)]
    [InlineData("01", ResourceNameConstants.TotalPoints)]
    [InlineData("0102", "Set 2")]
    [InlineData("3901", "First Serve")]
    [InlineData("3914", "Will there be a 5th Set?")]
    [InlineData("39030102", "Set 1 Race to 2 Points")]
    [InlineData("39090203", "Set 2 Point 3 Winner")]
    [InlineData("39150304", "Set 3 4 Points Played")]
    [InlineData("12345", "")]
    public void GetInnsBetTypeName_Always_ReturnCorrectBetTypeName(string resourceId, string betTypeName)
    {
        var service = new VolleyballResourceNameService();
        var actual = service.GetResourceName(resourceId);

        Assert.Equal(betTypeName, actual);
    }
}