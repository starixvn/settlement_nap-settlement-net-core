using Settlement.Sportsbook.Aio.Constants.Basketball;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Basketball;

public interface IGroupBetTypeService
{
    GroupNameModel GroupOtherBetType(ResultDetail resultDetail);

    GroupNameModel GroupHalfBetType(int resourceId);

    GroupNameModel GroupQuarterBetType(int resourceId);

    GroupNameModel GroupPlayerBetType(ResultDetail resultDetail, IList<OddFlexModel> oddFlexs);
}

public class GroupBetTypeServiceImp : IGroupBetTypeService
{
    private const string DefaultPlayerGroupName = "Other";
    private const int PlayerGroupIdOffset = 100;

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

    public GroupNameModel GroupPlayerBetType(ResultDetail resultDetail, IList<OddFlexModel> oddFlexs)
    {
        resultDetail.OddFlex = oddFlexs.Where(x => x.ResourceId == resultDetail.ResourceId).ToList();
        if (GroupBetType.MostPointsType.Contains(resultDetail.BetType))
        {
            return new GroupNameModel
            {
                GroupId = PlayerGroupIdOffset,
                GroupName = DefaultPlayerGroupName
            };
        }

        var matchingOddFlex = resultDetail.OddFlex.FirstOrDefault();

        if (matchingOddFlex != null)
        {
            return new GroupNameModel
            {
                GroupId = matchingOddFlex.Info.PlayerId + PlayerGroupIdOffset,
                GroupName = $"@teamName-{matchingOddFlex.Info.TeamId} {matchingOddFlex.Info.PlayerName}"
            };
        }

        return new GroupNameModel
        {
            GroupId = PlayerGroupIdOffset,
            GroupName = DefaultPlayerGroupName
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