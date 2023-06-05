using Settlement.ResourceInfos.Constants;
using Settlement.ResourceInfos.Services;
using Settlement.Sportsbook.Aio.Constants.Basketball;
using Settlement.Sportsbook.Aio.Models;
using ResultDetail = Settlement.Sportsbook.Aio.Models.ResultDetail;

namespace Settlement.Sportsbook.Aio.Services.Basketball;

public interface IBasketballBetTypeService
{
    ResultDetail GetBetTypeNameAndGroup(ResultDetail item);

    ResultDetail CheckValue(ResultDetail item);
}

public class BasketballBetTypeServiceImp : IBasketballBetTypeService
{
    private readonly IGroupBetTypeService groupBetTypeService;
    private readonly IResourceNameService resourceNameService;

    private const int HalfBetTypeLength = 5;
    private const int BetTypeIndexLength = 2;
    private const int QuarterBetTypeLength = 7;

    public BasketballBetTypeServiceImp(
        IGroupBetTypeService groupBetTypeService,
        IResourceNameService resourceNameService)
    {
        this.groupBetTypeService = groupBetTypeService;
        this.resourceNameService = resourceNameService;
    }

    public ResultDetail GetBetTypeNameAndGroup(ResultDetail item)
    {
        var resourceId = item.ResourceId;
        (item.BetType, item.BetTypeName) = resourceNameService.GetResourceName(resourceId, KeyConstants.BasketballKey);
        GroupBasketballBetType(item);

        return item;
    }

    private void GroupBasketballBetType(ResultDetail resultDetail)
    {
        const int otherBetTypeLength = 3;
        var resourceId = resultDetail.ResourceId;
        var group = new GroupNameModel();
        if (resourceId.Length == otherBetTypeLength)
        {
            group = groupBetTypeService.GroupOtherBetType(resultDetail);
        }

        if (resourceId.Length is QuarterBetTypeLength or HalfBetTypeLength)
        {
            group = GroupHalfBetType(resultDetail, group);
            group = GroupQuarterBetType(resultDetail, group);
        }

        resultDetail.GroupName = group.GroupName;
        resultDetail.GroupId = group.GroupId;
    }

    private GroupNameModel GroupHalfBetType(ResultDetail resultDetail, GroupNameModel group)
    {
        var resourceIdHalfBetType =
            SplitBetType(resultDetail.ResourceId, 0, HalfBetTypeLength - BetTypeIndexLength);
        return IsHalfBetType(resourceIdHalfBetType)
            ? groupBetTypeService.GroupHalfBetType(resourceIdHalfBetType)
            : group;
    }

    private GroupNameModel GroupQuarterBetType(ResultDetail resultDetail, GroupNameModel group)
    {
        var resourceIdQuarterBetType =
            SplitBetType(resultDetail.ResourceId, 0, QuarterBetTypeLength - BetTypeIndexLength);
        return IsQuarterBetType(resourceIdQuarterBetType)
            ? groupBetTypeService.GroupQuarterBetType(resourceIdQuarterBetType)
            : group;
    }

    private static bool IsHalfBetType(int resourceId)
    {
        return GroupBetType.FirstHalf.Contains(resourceId) || GroupBetType.SecondHalf.Contains(resourceId);
    }

    private static bool IsQuarterBetType(int resourceId)
    {
        return GroupBetType.QuarterOne.Contains(resourceId)
               || GroupBetType.QuarterTwo.Contains(resourceId)
               || GroupBetType.QuarterThree.Contains(resourceId)
               || GroupBetType.QuarterFour.Contains(resourceId);
    }

    public ResultDetail CheckValue(ResultDetail item)
    {
        item.HomeValue ??= "";
        item.AwayValue ??= "";
        return item;
    }

    private static int SplitBetType(string resourceId, int startIndex, int length)
    {
        return Convert.ToInt32(resourceId.Substring(startIndex, length));
    }
}