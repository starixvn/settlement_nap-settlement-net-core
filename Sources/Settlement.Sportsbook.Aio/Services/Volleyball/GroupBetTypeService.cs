using Settlement.Sportsbook.Aio.Constants.Volleyball;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Volleyball;

public interface IGroupBetTypeService
{
    void SetGroupNameAndInputType(ResultDetail resultDetail, int betTypeId);
}

public class GroupBetTypeServiceImp : IGroupBetTypeService
{
    public void SetGroupNameAndInputType(ResultDetail resultDetail, int betTypeId)
    {
        resultDetail.GroupName = GetGroupName(resultDetail, betTypeId);
        resultDetail.InputType = GetInputType(betTypeId);
    }

    private static string GetGroupName(ResultDetail resultDetail, int betTypeId)
    {
        if (GroupBetType.Other.Contains(betTypeId))
        {
            return "Other";
        }
        else
        {
            var set = Convert.ToInt32(resultDetail.ResourceId.Substring(4, 2));
            return $"Set {set}";
        }
    }

    private static int GetInputType(int betTypeId)
    {
        if (InputType.HomeAway.Contains(betTypeId))
        {
            return InputType.HomeAwayId;
        }

        if (InputType.HomeAwayNone.Contains(betTypeId))
        {
            return InputType.HomeAwayNoneId;
        }

        if (InputType.YesNo.Contains(betTypeId))
        {
            return InputType.YesNoId;
        }

        return InputType.CoupleScoreId;
    }
}