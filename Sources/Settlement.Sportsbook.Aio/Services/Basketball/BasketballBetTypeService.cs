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
    Task GetOddFlex(List<ResultDetail> items);

    void GroupingBettype(IList<ResultDetail> items);

    ResultDetail CheckValue(ResultDetail item);

    void RemoveDuplicatedResources(List<ResultDetail> originalResultDetails);
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

    public async Task GetOddFlex(List<ResultDetail> items)
    {
        if (!items.Any())
        {
            return;
        }

        var oddFlexsFlexModels = (await GetOddFlex(items[0].MatchId)).ToList();
        foreach (var item in items)
        {
            (item.BetType, item.BetTypeName) = resourceNameService.GetResourceName(item.ResourceId, KeyConstants.BasketballKey);
            item.OddFlex = oddFlexsFlexModels.Where(o => o.ResourceId == item.ResourceId && o.BetType is not null).ToList();
        }

        IdentifyRelatedResource(items, oddFlexsFlexModels);
    }

    public void GroupingBettype(IList<ResultDetail> items)
    {
        foreach (var item in items)
        {
            (item.BetType, item.BetTypeName) = resourceNameService.GetResourceName(item.ResourceId, KeyConstants.BasketballKey);
            GroupResultDetail(item);
        }
    }

    private void GroupResultDetail(ResultDetail item)
    {
        var resourceId = item.ResourceId;
        if (resourceId.Length >= MinResourceIdLength && GroupBetType.Player.Contains(Convert.ToInt32(resourceId.Substring(0, MinResourceIdLength))))
        {
            GroupPlayerBetType(item);
            item.BetTypeName = item.InValid ? string.Empty : generateBetTypeNameService.GenerateBetTypeName(item);
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

        oddFlex.ForEach(playerModel =>
        {
            try
            {
                playerModel.Info = JsonConvert.DeserializeObject<OddsInfoModel>(playerModel.OddsInfo);
            }
            catch
            {
                playerModel.Info = null;
            }
        });

        return oddFlex;
    }

    private void GroupPlayerBetType(ResultDetail resultDetail)
    {
        var group = groupBetTypeService.GroupPlayerBetType(resultDetail);
        resultDetail.InValid = resultDetail.OddFlex.Any(o => o.Info is null);
        resultDetail.GroupName = group.GroupName;
        resultDetail.GroupId = group.GroupId;
        resultDetail.InputType = (int)inputTypeService.GetInputType(resultDetail.BetType);
    }

    private static void IdentifyRelatedResource(List<ResultDetail> earlyResultDetails, List<OddFlexModel> oddFlex)
    {
        var dependentResources = earlyResultDetails.Where(r => GroupBetType.DependentResources.Contains(r.BetType)).ToList();
        dependentResources.ForEach(resultDetail =>
        {
            GenerateResultByOddFlex(oddFlex, resultDetail, earlyResultDetails);
            SetOddFlexForRelatedResource(resultDetail, earlyResultDetails);
        });
    }

    private static void GenerateResultByOddFlex(List<OddFlexModel> oddFlex, ResultDetail dependentResource, List<ResultDetail> originalResultDetail)
    {
        var relatedBetTypes = GetRelatedBetTypes(dependentResource);
        var relatedPlayers = GetRelatedPlayers(dependentResource);
        var relatedResourceIds = new List<string>();

        foreach (var betType in relatedBetTypes)
        {
            var matchingOddFlex = FindMatchingOddFlex(oddFlex, relatedPlayers, betType);
            relatedResourceIds.AddRange(matchingOddFlex.Select(r => r.ResourceId));
            GenerateResultDetail(matchingOddFlex, originalResultDetail);
        }

        dependentResource.RelatedCalResources = string.Join(',', relatedResourceIds.Distinct());
    }

    private static List<string> GetRelatedBetTypes(ResultDetail dependentResource)
    {
        return dependentResource.OddFlex
            .SelectMany(r => r.RelatedBettype.Split(','))
            .Distinct()
            .ToList();
    }

    private static string GetRelatedPlayers(ResultDetail dependentResource)
    {
        return string.Join(',', dependentResource.OddFlex.Select(r => r.Info.PlayerId));
    }

    private static List<OddFlexModel> FindMatchingOddFlex(List<OddFlexModel> oddFlex, string relatedPlayers, string betType)
    {
        const int bettypeIndex = 3;
        return oddFlex
            .Where(o => relatedPlayers.Contains(o.Info.PlayerId.ToString()) && o.ResourceId[..bettypeIndex] == betType)
            .DistinctBy(r => r.ResourceId)
            .ToList();
    }

    private static void GenerateResultDetail(List<OddFlexModel> relatedOddFlex, List<ResultDetail> originalResultDetail)
    {
        var newResultDetails = GetNewResultDetails(relatedOddFlex, originalResultDetail);

        if (newResultDetails.Any())
        {
            originalResultDetail.AddRange(newResultDetails);
        }
    }

    private static List<ResultDetail> GetNewResultDetails(List<OddFlexModel> relatedOddFlex, List<ResultDetail> originalResultDetail)
    {
        return relatedOddFlex
            .Where(oddFlex => !originalResultDetail.Exists(r => r.ResourceId == oddFlex.ResourceId))
            .Select(CreateResultDetail)
            .ToList();
    }

    private static ResultDetail CreateResultDetail(OddFlexModel oddFlex)
    {
        return new ResultDetail
        {
            ResourceId = oddFlex.ResourceId,
            BetType = oddFlex.BetType,
            TicketStatus = TicketStatus.NoTicket,
            OtherInfo = $"{oddFlex.Info.PlayerId},{oddFlex.Info.TeamId}",
            OddFlex = [oddFlex]
        };
    }

    private static void SetOddFlexForRelatedResource(ResultDetail dependentResource, List<ResultDetail> originalResultDetails)
    {
        var relatedResources = GetRelatedResources(dependentResource, originalResultDetails);

        foreach (var resultDetail in relatedResources.Where(ShouldSetOddFlex))
        {
            SetOddFlexForResource(dependentResource, resultDetail);
        }
    }

    private static List<ResultDetail> GetRelatedResources(ResultDetail dependentResource, List<ResultDetail> originalResultDetails)
    {
        return originalResultDetails
            .Where(r => dependentResource.RelatedCalResources.Contains(r.ResourceId))
            .ToList();
    }

    private static bool ShouldSetOddFlex(ResultDetail resultDetail)
    {
        return !string.IsNullOrEmpty(resultDetail.OtherInfo) && resultDetail.OddFlex.Count == 0;
    }

    private static void SetOddFlexForResource(ResultDetail dependentResource, ResultDetail resultDetail)
    {
        resultDetail.OddFlex = GetMatchingOddFlexForResource(dependentResource, resultDetail);
    }

    private static List<OddFlexModel> GetMatchingOddFlexForResource(ResultDetail dependentResource, ResultDetail resultDetail)
    {
        return dependentResource.OddFlex
            .Where(o => resultDetail.OtherInfo.Contains(o.Info.PlayerId.ToString()))
            .ToList();
    }

    public void RemoveDuplicatedResources(List<ResultDetail> originalResultDetails)
    {
        var duplicateGroups = FindDuplicateGroups(originalResultDetails);

        foreach (var group in duplicateGroups)
        {
            ProcessDuplicateGroup(originalResultDetails, group);
        }
    }

    private static List<IGrouping<dynamic, ResultDetail>> FindDuplicateGroups(List<ResultDetail> originalResultDetails)
    {
        return originalResultDetails
            .GroupBy(resultDetail => new
            {
                resultDetail.BetType,
                resultDetail.OddFlex?.FirstOrDefault()?.Info.PlayerId
            })
            .Where(g => g.Count() > 1 && g.Key.PlayerId is not null)
            .Cast<IGrouping<dynamic, ResultDetail>>()
            .ToList();
    }

    private static void ProcessDuplicateGroup(List<ResultDetail> originalResultDetails, IGrouping<dynamic, ResultDetail> group)
    {
        var groupKey = group.Key;

        originalResultDetails.RemoveAll(r => r.BetType == groupKey.BetType &&
                                           r.OddFlex?.FirstOrDefault()?.Info.PlayerId == groupKey.PlayerId);

        var significantResource = FindMostSignificantResource(group);

        originalResultDetails.Add(significantResource);
    }

    private static ResultDetail FindMostSignificantResource(IGrouping<dynamic, ResultDetail> group)
    {
        var settledResult = group.FirstOrDefault(r => r.ResultStatusId is ResultStatus.AutoSettled or ResultStatus.ManuallySettled);
        if (settledResult is not null)
        {
            return settledResult;
        }

        var originalResult = group.FirstOrDefault(r => int.Parse(r.ResourceId[^2..]) < 11);
        if (originalResult is not null)
        {
            return originalResult;
        }

        return group.First();
    }
}