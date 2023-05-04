using Settlement.ResourceName.Constants;
using Settlement.ResourceName.Services.Others;

namespace Settlement.ResourceName.UnitTests.Services.Others;

public class GameTotalResourceNameTests
{
    [Theory]
    [InlineData("00", ResourceNameConstants.TotalSets, "00")]
    [InlineData("01", ResourceNameConstants.TotalPoints, "01")]
    [InlineData("1", "1S", "1")]
    public void OtherResourceName_Always_ReturnCorrectBetTypeName(string resourceId, string betTypeName, string betType)
    {
        var service = new GameTotalResourceName();
        var actual = service.GetResourceName(resourceId, 0);

        Assert.Equal(betType, actual.Item1);
        Assert.Equal(betTypeName, actual.Item2);
    }
}