using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Basketball;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Basketball;

public class GroupBetTypeServiceTests
{
    private readonly IGroupBetTypeService service = new GroupBetTypeServiceImp();

    [Theory]
    [InlineData(606, 3)]
    [InlineData(607, 6)]
    public void GroupHalfBetType_Always_ReturnCorrectGroup(int resourceId, int groupId)
    {
        var result = service.GroupHalfBetType(resourceId);

        Assert.Equal(result.GroupId, groupId);
    }

    [Theory]
    [InlineData("605", "Other")]
    [InlineData("123", null)]
    public void GroupOtherBetType_Always_ReturnCorrectGroup(string resourceId, string groupName)
    {
        var result = service.GroupOtherBetType(new ResultDetail { ResourceId = resourceId });

        Assert.Equal(result.GroupName, groupName);
    }

    [Theory]
    [InlineData(61701, "Quarter 1")]
    [InlineData(61702, "Quarter 2")]
    [InlineData(61703, "Quarter 3")]
    [InlineData(61704, "Quarter 4")]
    public void GroupQuarterBetType_Always_ReturnCorrectGroup(int resourceId, string groupName)
    {
        var result = service.GroupQuarterBetType(resourceId);

        Assert.Equal(result.GroupName, groupName);
    }
}