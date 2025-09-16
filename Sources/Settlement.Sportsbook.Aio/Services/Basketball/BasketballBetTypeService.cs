using Newtonsoft.Json;
using Settlement.Core.Constants;
using Settlement.ResourceInfos.Constants;
using Settlement.ResourceInfos.Services;
using Settlement.Sportsbook.Aio.Constants.Basketball;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Models;
using ResultDetail = Settlement.Sportsbook.Aio.Models.ResultDetail;

namespace Settlement.Sportsbook.Aio.Services.Basketball;

public interface IBasketballBetTypeService
{
    Task GetBetTypeNameAndGroup(IList<ResultDetail> items);

    ResultDetail CheckValue(ResultDetail item);
}

public class BasketballBetTypeServiceImp(
    IGroupBetTypeService groupBetTypeService,
    IResourceNameService resourceNameService,
    IDynamicRepository dynamicRepository,
    IInputTypeService inputTypeService,
    IGenerateBetTypeNameService generateBetTypeNameService)
    : IBasketballBetTypeService
{
    private const int HalfBetTypeLength = 5;
    private const int BetTypeIndexLength = 2;
    private const int QuarterBetTypeLength = 7;
    private const int MinResourceIdLength = 3;

    public async Task GetBetTypeNameAndGroup(IList<ResultDetail> items)
    {
        if (!items.Any())
        {
            return;
        }

        var players = (await GetOddFlex(items[0].MatchId)).ToList();
        foreach (var item in items)
        {
            GroupResultDetail(item, players);
        }
    }

    private void GroupResultDetail(ResultDetail item, IList<OddFlexModel> players)
    {
        var resourceId = item.ResourceId;
        (item.BetType, item.BetTypeName) = resourceNameService.GetResourceName(resourceId, KeyConstants.BasketballKey);
        if (resourceId.Length >= MinResourceIdLength && GroupBetType.Player.Contains(Convert.ToInt32(resourceId.Substring(0, MinResourceIdLength))))
        {
            GroupPlayerBetType(item, players);
            item.BetTypeName = generateBetTypeNameService.GenerateBetTypeName(item);
        }
        else
        {
            GroupBasketballBetType(item);
            item.InputType = (int)InputType.TeamSelection;
        }
    }

    private void GroupBasketballBetType(ResultDetail resultDetail)
    {
        const int otherBetTypeLength = 3;
        var resourceId = resultDetail.ResourceId;
        var group = new GroupNameModel();
        switch (resourceId.Length)
        {
            case otherBetTypeLength:
                group = groupBetTypeService.GroupOtherBetType(resultDetail);
                break;

            case QuarterBetTypeLength or HalfBetTypeLength:
                group = GroupHalfBetType(resultDetail, group);
                group = GroupQuarterBetType(resultDetail, group);
                break;

            default:
                group = new GroupNameModel();
                break;
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

    private async Task<IEnumerable<OddFlexModel>> GetOddFlex(int matchId)
    {
        var criteria = new GetPlayerInfoCriteria
        {
            MatchId = matchId,
            SportType = SportType.BasketBall
        };
        var oddFlex = (await dynamicRepository.FetchAsync<OddFlexModel>(criteria)).ToList();

        oddFlex.ForEach(playerModel => playerModel.Info = JsonConvert.DeserializeObject<OddsInfoModel>(playerModel.OddsInfo));

        return oddFlex;
    }

    private void GroupPlayerBetType(ResultDetail resultDetail, IList<OddFlexModel> players)
    {
        var group = groupBetTypeService.GroupPlayerBetType(resultDetail, players);
        resultDetail.GroupName = group.GroupName;
        resultDetail.GroupId = group.GroupId;
        resultDetail.InputType = (int)inputTypeService.GetInputType(resultDetail.BetType);
    }
}