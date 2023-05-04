using Settlement.Core.Constants;
using Settlement.ResourceName.Constants;
using Settlement.ResourceName.Services.Others;

namespace Settlement.ResourceName.UnitTests.Services.Others;

public class OtherResourceNameTests
{
    [Theory]
    [InlineData("00", 0, ResourceNameConstants.Final, "00")]
    [InlineData("01", 0, ResourceNameConstants.HalfTime, "01")]
    [InlineData("OT", 0, ResourceNameConstants.OverTime, "OT")]
    [InlineData("OT", SportType.BaseBall, ResourceNameConstants.ExtraInning, "OT")]
    [InlineData("1", 0, "1", "1")]
    [InlineData("1", SportType.Football, "1Q", "1")]
    [InlineData("1", SportType.Rugby, "1Q", "1")]
    [InlineData("1", SportType.NetBall, "1Q", "1")]
    [InlineData("1", SportType.IceHockey, "1P", "1")]
    [InlineData("1", SportType.FieldHockey, "1P", "1")]
    public void OtherResourceName_Always_ReturnCorrectBetTypeName(string resourceId, int sportType, string betTypeName, string betType)
    {
        var service = new OtherResourceName();
        var actual = service.GetResourceName(resourceId, sportType);

        Assert.Equal(betType, actual.Item1);
        Assert.Equal(betTypeName, actual.Item2);
    }
}