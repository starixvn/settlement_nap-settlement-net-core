using Settlement.ResourceName.Constants;
using Settlement.ResourceName.Services.Volleyball;

namespace Settlement.BettypeName.UnitTests.Services.Volleyball;

public class VolleyballBResourceNameServiceTests
{
    [Theory]
    [InlineData("00", ResourceNameConstants.Match, "00")]
    [InlineData("01", ResourceNameConstants.TotalPoints, "01")]
    [InlineData("0102", "Set 2", "0102")]
    [InlineData("3901", "First Serve", "3901")]
    [InlineData("3914", "Will there be a 5th Set?", "3914")]
    [InlineData("39030102", "Set 1 Race to 2 Points", "3903")]
    [InlineData("39090203", "Set 2 Point 3 Winner", "3909")]
    [InlineData("39150304", "Set 3 4 Points Played", "3915")]
    [InlineData("12345", "", "1234")]
    public void GetInnsBetTypeName_Always_ReturnCorrectBetTypeName(string resourceId, string betTypeName, string betType)
    {
        var service = new VolleyballResourceNameService();
        var actual = service.GetResourceName(resourceId, 0);

        Assert.Equal(betType, actual.Item1);
        Assert.Equal(betTypeName, actual.Item2);
    }
}