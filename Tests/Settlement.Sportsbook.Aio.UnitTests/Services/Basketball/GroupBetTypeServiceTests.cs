using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Basketball;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Basketball;

public class GroupBetTypeServiceTests
{
    private readonly IGroupBetTypeService service = new GroupBetTypeServiceImp();

    [Theory]
    [InlineData(606, 3, "1st Half")]
    [InlineData(607, 6, "2nd Half")]
    public void GroupHalfBetType_Always_ReturnCorrectGroup(int resourceId, int groupId, string groupName)
    {
        // Arrange & Act
        var result = service.GroupHalfBetType(resourceId);

        // Assert
        Assert.Equal(groupId, result.GroupId);
        Assert.Equal(groupName, result.GroupName);
    }

    [Theory]
    [InlineData("605", 0, "Other")]
    [InlineData("604", 0, "Other")]
    [InlineData("123", 0, null)]
    public void GroupOtherBetType_Always_ReturnCorrectGroup(string resourceId, int groupId, string groupName)
    {
        // Arrange
        var resultDetail = new ResultDetail { ResourceId = resourceId };

        // Act
        var result = service.GroupOtherBetType(resultDetail);

        // Assert
        Assert.Equal(groupId, result.GroupId);
        Assert.Equal(groupName, result.GroupName);
    }

    [Theory]
    [InlineData(61701, 1, "Quarter 1")]
    [InlineData(61301, 1, "Quarter 1")]
    [InlineData(61702, 2, "Quarter 2")]
    [InlineData(61302, 2, "Quarter 2")]
    [InlineData(61703, 4, "Quarter 3")]
    [InlineData(61303, 4, "Quarter 3")]
    [InlineData(61704, 5, "Quarter 4")]
    [InlineData(61304, 5, "Quarter 4")]
    public void GroupQuarterBetType_Always_ReturnCorrectGroup(int resourceId, int groupId, string groupName)
    {
        // Arrange & Act
        var result = service.GroupQuarterBetType(resourceId);

        // Assert
        Assert.Equal(groupId, result.GroupId);
        Assert.Equal(groupName, result.GroupName);
    }

    [Theory]
    [InlineData("680", 101, "Head to Head")]
    [InlineData("681", 101, "Head to Head")]
    [InlineData("682", 101, "Head to Head")]
    [InlineData("683", 101, "Head to Head")]
    [InlineData("684", 101, "Head to Head")]
    public void GroupPlayerBetType_PlayerSelectionType_ReturnsDefaultGroup(string betType, int groupId,
        string groupName)
    {
        // Arrange
        var resultDetail = new ResultDetail { BetType = betType };

        // Act
        var result = service.GroupPlayerBetType(resultDetail);

        // Assert
        Assert.Equal(groupId, result.GroupId);
        Assert.Equal(groupName, result.GroupName);
    }
}