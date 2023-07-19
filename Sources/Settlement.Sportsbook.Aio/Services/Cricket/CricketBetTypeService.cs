using Settlement.ResourceInfos.Constants;
using Settlement.Sportsbook.Aio.Criteria.Cricket;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Cricket;

using Constants.Cricket;
using Settlement.ResourceInfos.Services;
using System.Collections.Generic;

public interface ICricketBetTypeService
{
    void GroupBetTypesAndGenerateNames(List<ResultDetail> resultDetails);
}

public class CricketBetTypeService : ICricketBetTypeService
{
    private readonly IDynamicRepository repository;
    private readonly IResourceNameService resourceNameService;
    private readonly IGroupNameService groupNameService;
    private readonly InputTypeService inputTypeService;
    private const int InnsBetTypeMinLength = 5;

    public CricketBetTypeService(
        IDynamicRepository repository,
        IResourceNameService resourceNameService,
        IGroupNameService groupNameService,
        InputTypeService inputTypeService)
    {
        this.repository = repository;
        this.resourceNameService = resourceNameService;
        this.groupNameService = groupNameService;
        this.inputTypeService = inputTypeService;
    }

    public void GroupBetTypesAndGenerateNames(List<ResultDetail> resultDetails)
    {
        var inputOptions = new List<InputOption>();

        if (IsExistedPlayerName(resultDetails))
        {
            var matchId = resultDetails.FirstOrDefault()!.MatchId;
            inputOptions = GetInputOptions(matchId);
        }

        resultDetails.ForEach(resultDetail =>
        {
            GenerateBetTypeNameAndGroup(resultDetail, inputOptions);
        });
    }

    private List<InputOption> GetInputOptions(int matchId)
    {
        const char semicolon = ',';

        var getPlayerCriteria = new GetPlayerInfoCriteria { MatchId = matchId };
        var inputOptions = repository.Fetch<InputOption>(getPlayerCriteria)
            .Where(option => option.OddsInfo.Contains(semicolon)).ToList();

        inputOptions.ForEach(option =>
        {
            var oddsInfos = option.OddsInfo.Split(semicolon);
            option.PlayerId = Convert.ToInt32(oddsInfos[0]);
            option.OptionName = oddsInfos[1];
        });

        return inputOptions.OrderBy(option => option.OptionName).ToList();
    }

    private static bool IsExistedPlayerName(List<ResultDetail> resultDetails)
    {
        return resultDetails.Exists(result =>
        {
            var betTypeId = SplitBetType(result.ResourceId, 0, 4);
            return GroupBetType.IncludedPlayerName.Contains(betTypeId) || InputType.PlayerSelectGroup.Contains(betTypeId) || InputType.PlayerMultipleSelectGroup.Contains(betTypeId);
        });
    }

    private void GetResultDetailWithResourceIdLessThanFive(ResultDetail resultDetail)
    {
        var betTypeId = Convert.ToInt32(resultDetail.ResourceId);
        if (IsNonInnsBetTypeGroup(betTypeId))
        {
            var group = groupNameService.GroupNonInnsBetType(betTypeId);
            resultDetail.GroupId = group.GroupId;
            resultDetail.GroupName = group.GroupName;
        }

        resultDetail.InputType = inputTypeService.GetNonInnsBetTypeInputType(betTypeId);
    }

    private void GetResultDetailWithResourceIdGreaterThanFive(ResultDetail resultDetail, List<InputOption> inputOptions)
    {
        var resourceId = resultDetail.ResourceId;
        var betTypeId = SplitBetType(resourceId, 0, 4);

        if (GroupBetType.IncludedPlayerName.Contains(betTypeId) || GroupBetType.IncludedTwoPlayerName.Contains(betTypeId))
        {
            var value = inputTypeService.GetInnsInputLabel(resourceId, betTypeId, inputOptions);
            resultDetail.HomeName = value.HomeValue;
            resultDetail.AwayName = value.AwayValue;
        }

        if (IsInnsBetTypeGroup(betTypeId))
        {
            var group = groupNameService.GroupInnsBetType(betTypeId, resourceId);
            resultDetail.GroupId = group.GroupId;
            resultDetail.GroupName = group.GroupName;
        }

        if (InputType.PlayerSelectGroup.Contains(betTypeId) || InputType.PlayerMultipleSelectGroup.Contains(betTypeId) || InputType.ScoreWithLabelGroup.Contains(betTypeId))
        {
            resultDetail.InputOptions = inputTypeService.GetInputOptions(betTypeId, resourceId, inputOptions);
        }

        resultDetail.InputType = inputTypeService.GetInnsBetTypeInputType(betTypeId);
    }

    private void GenerateBetTypeNameAndGroup(ResultDetail resultDetail, List<InputOption> inputOptions)
    {
        var resourceId = resultDetail.ResourceId;
        (resultDetail.BetType, resultDetail.BetTypeName) = resourceNameService.GetResourceName(resourceId, KeyConstants.CricketKey);
        if (resourceId.Length < InnsBetTypeMinLength)
        {
            GetResultDetailWithResourceIdLessThanFive(resultDetail);
        }
        else
        {
            GetResultDetailWithResourceIdGreaterThanFive(resultDetail, inputOptions);
        }
    }

    private static bool IsNonInnsBetTypeGroup(int betTypeId)
    {
        return GroupBetType.Other.Contains(betTypeId) || GroupBetType.MatchBetType.Contains(betTypeId);
    }

    private static bool IsInnsBetTypeGroup(int betTypeId)
    {
        return GroupBetType.InnsHome.Contains(betTypeId)
               || GroupBetType.InnsAway.Contains(betTypeId)
               || GroupBetType.Other.Contains(betTypeId)
               || GroupBetType.MatchBetType.Contains(betTypeId);
    }

    private static int SplitBetType(string resourceId, int startIndex, int length)
    {
        return Convert.ToInt32(resourceId.Substring(startIndex, length));
    }
}