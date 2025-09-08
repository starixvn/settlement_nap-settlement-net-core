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
    [InlineData("680", 100, "Other")]
    [InlineData("681", 100, "Other")]
    [InlineData("682", 100, "Other")]
    [InlineData("683", 100, "Other")]
    [InlineData("684", 100, "Other")]
    public void GroupPlayerBetType_PlayerSelectionType_ReturnsDefaultGroup(string betType, int groupId, string groupName)
    {
        // Arrange
        var resultDetail = new ResultDetail { BetType = betType };
        var oddFlexs = new List<OddFlexModel>();

        // Act
        var result = service.GroupPlayerBetType(resultDetail, oddFlexs);

        // Assert
        Assert.Equal(groupId, result.GroupId);
        Assert.Equal(groupName, result.GroupName);
    }

    [Fact]
    public void GroupPlayerBetType_WithMatchingOddFlex_ReturnsPlayerGroup()
    {
        // Arrange
        var resultDetail = new ResultDetail { ResourceId = "65301" };
        var oddFlexs = new List<OddFlexModel>
        {
            new()
            {
                ResourceId = "65301",
                Info = new OddsInfoModel
                {
                    PlayerId  = 123,
                    PlayerName = "Levi",
                    TeamId = 123
                }
            }
        };

        // Act
        var result = service.GroupPlayerBetType(resultDetail, oddFlexs);

        // Assert
        Assert.Equal(223, result.GroupId);
        Assert.Equal("@teamName-123-Levi", result.GroupName);
    }

    [Fact]
    public void GroupPlayerBetType_NoMatchingOddFlex_ReturnsDefaultGroup()
    {
        // Arrange
        var resultDetail = new ResultDetail { ResourceId = "65301" };
        var oddFlexs = new List<OddFlexModel>
        {
            new()
            {
                ResourceId = "65401",
                Info = new OddsInfoModel
                {
                    PlayerId = 123,
                    PlayerName = "Player Name"
                }
            }
        };

        // Act
        var result = service.GroupPlayerBetType(resultDetail, oddFlexs);

        // Assert
        Assert.Equal(100, result.GroupId);
        Assert.Equal("Other", result.GroupName);
    }

    [Fact]
    public void GroupPlayerBetType_EmptyOddFlexs_ReturnsDefaultGroup()
    {
        // Arrange
        var resultDetail = new ResultDetail { ResourceId = "65301" };
        var oddFlexs = new List<OddFlexModel>();

        // Act
        var result = service.GroupPlayerBetType(resultDetail, oddFlexs);

        // Assert
        Assert.Equal(100, result.GroupId);
        Assert.Equal("Other", result.GroupName);
    }

    [Fact]
    public void GroupPlayerBetType_ModifyResultDetailOddFlex()
    {
        // Arrange
        var resultDetail = new ResultDetail { ResourceId = "65301" };
        var oddFlexs = new List<OddFlexModel>
        {
            new()
            {
                ResourceId = "65301",
                Info = new OddsInfoModel
                {
                    PlayerId = 123,
                    PlayerName = "Player Name"
                }
            }
        };

        // Act
        service.GroupPlayerBetType(resultDetail, oddFlexs);

        // Assert
        Assert.Single(resultDetail.OddFlex);
    }
}