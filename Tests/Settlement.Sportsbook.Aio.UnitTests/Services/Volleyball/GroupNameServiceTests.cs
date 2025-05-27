using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Volleyball;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Volleyball;

public class GroupBetTypeServiceTests
{
    private readonly IGroupBetTypeService service = new GroupBetTypeServiceImp();

    [Theory]
    [InlineData(3901, "Other", 2, "3901")]
    [InlineData(3903, "Set 1", 4, "390301")]
    [InlineData(3909, "Set 2", 0, "390902")]
    [InlineData(3914, "Other", 3, "3914")]
    public void SetGroupNameAndInputType_Always_GetCorrectGroupForBetType(int betTypeId, string groupName, int inputType, string resourceId)
    {
        var resultDetail = new ResultDetail { ResourceId = resourceId };
        service.SetGroupNameAndInputType(resultDetail, betTypeId);

        Assert.Equal(groupName, resultDetail.GroupName);
        Assert.Equal(inputType, resultDetail.InputType);
    }
}