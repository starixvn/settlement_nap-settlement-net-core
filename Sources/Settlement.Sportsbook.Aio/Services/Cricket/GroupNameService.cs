using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Cricket;

using Constants.Cricket;

public interface IGroupNameService
{
    GroupNameModel GroupNonInnsBetType(int betTypeId);

    GroupNameModel GroupInnsBetType(int betTypeId, string resourceId);
}

public class GroupNameServiceImp : IGroupNameService
{
    public GroupNameModel GroupNonInnsBetType(int betTypeId)
    {
        return GroupBetType.Other.Contains(betTypeId)
            ? new GroupNameModel
            {
                GroupId = GroupBetType.OtherId,
                GroupName = GroupBetType.OtherName
            }
            : new GroupNameModel
            {
                GroupId = GroupBetType.MatchBetTypeId,
                GroupName = GroupBetType.MatchBetTypeName
            };
    }

    public GroupNameModel GroupInnsBetType(int betTypeId, string resourceId)
    {
        const int numberOfInnsPosition = 4;
        const int numberOfInnsLength = 1;
        var numberOfInns = BetType(resourceId, numberOfInnsPosition, numberOfInnsLength);
        if (GroupBetType.InnsHome.Contains(betTypeId))
        {
            return new GroupNameModel
            {
                GroupId = numberOfInns == 1 ? GroupBetType.FirstInnsHomeId : GroupBetType.SecondInnsHomeId,
                GroupName = numberOfInns == 1 ? GroupBetType.FirstInnsHomeName : GroupBetType.SecondInnsHomeName
            };
        }

        if (GroupBetType.InnsAway.Contains(betTypeId))
        {
            return new GroupNameModel
            {
                GroupId = numberOfInns == 1 ? GroupBetType.FirstInnsAwayId : GroupBetType.SecondInnsAwayId,
                GroupName = numberOfInns == 1 ? GroupBetType.FirstInnsAwayName : GroupBetType.SecondInnsAwayName
            };
        }

        return GroupNonInnsBetType(betTypeId);
    }

    private static int BetType(string resourceId, int startIndex, int length)
    {
        return Convert.ToInt32(resourceId.Substring(startIndex, length));
    }
}