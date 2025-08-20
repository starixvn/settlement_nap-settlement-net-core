using Settlement.Sportsbook.Aio.Constants.Basketball;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Basketball;

public interface IGroupBetTypeService
{
    GroupNameModel GroupOtherBetType(ResultDetail resultDetail);

    GroupNameModel GroupHalfBetType(int resourceId);

    GroupNameModel GroupQuarterBetType(int resourceId);

    GroupNameModel GroupPlayerBetType(string resourceId, IDictionary<int, string> players);
}

public class GroupBetTypeServiceImp : IGroupBetTypeService
{
    public GroupNameModel GroupHalfBetType(int resourceId)
    {
        return GroupBetType.FirstHalf.Contains(resourceId)
            ? new GroupNameModel
            {
                GroupName = GroupBetType.FirstHalfName,
                GroupId = GroupBetType.FirstHalfId
            }
            : new GroupNameModel
            {
                GroupName = GroupBetType.SecondHalfName,
                GroupId = GroupBetType.SecondHalfId
            };
    }

    public GroupNameModel GroupOtherBetType(ResultDetail resultDetail)
    {
        var resourceId = Convert.ToInt32(resultDetail.ResourceId);
        return GroupBetType.Other.Contains(resourceId)
            ? new GroupNameModel
            {
                GroupId = GroupBetType.OtherId,
                GroupName = GroupBetType.OtherName
            }
            : new GroupNameModel();
    }

    public GroupNameModel GroupPlayerBetType(string resourceId, IDictionary<int, string> players)
    {
        var playerOrder = Convert.ToInt32(resourceId.Substring(3, 5));


        if (players.TryGetValue(playerOrder, out var playerName))
        {
            return new GroupNameModel
            {
                GroupId = playerOrder + 100,
                GroupName = playerName
            };
        }

        return new GroupNameModel
        {
            GroupId = 0,
            GroupName = string.Empty
        };
    }

    public GroupNameModel GroupQuarterBetType(int resourceId)
    {
        if (GroupBetType.QuarterOne.Contains(resourceId))
        {
            return new GroupNameModel
            {
                GroupId = GroupBetType.QuarterOneId,
                GroupName = GroupBetType.QuarterOneName
            };
        }

        if (GroupBetType.QuarterTwo.Contains(resourceId))
        {
            return new GroupNameModel
            {
                GroupId = GroupBetType.QuarterTwoId,
                GroupName = GroupBetType.QuarterTwoName
            };
        }

        if (GroupBetType.QuarterThree.Contains(resourceId))
        {
            return new GroupNameModel
            {
                GroupId = GroupBetType.QuarterThreeId,
                GroupName = GroupBetType.QuarterThreeName
            };
        }

        return new GroupNameModel
        {
            GroupId = GroupBetType.QuarterFourId,
            GroupName = GroupBetType.QuarterFourName
        };
    }
}