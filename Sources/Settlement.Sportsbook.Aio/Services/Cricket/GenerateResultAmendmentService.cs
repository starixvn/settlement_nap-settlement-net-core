using Settlement.Constants;
using Settlement.Models;
using Settlement.ResourceInfos.Constants;
using Settlement.Sportsbook.Aio.Constants.Cricket;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Cricket;

public interface GenerateResultAmendmentService
{
    (string, string) CreateWrongActualResults(List<ResultChanged> resultsChanged, List<ResourceItem> selectedResources);

    string CreateExtraInfo(List<ResultChanged> resultsChanged);
}

public class GenerateResultAmendmentServiceImp(XmlConvertService xmlConvertService) : GenerateResultAmendmentService
{
    public (string, string) CreateWrongActualResults(List<ResultChanged> resultsChanged, List<ResourceItem> selectedResources)
    {
        var wrongResults = new List<CricketResultItem>();
        var actualResults = new List<CricketResultItem>();

        foreach (var resultChanged in resultsChanged)
        {
            var resourceItem = selectedResources.Find(x => x.ResourceId == resultChanged.ResourceId);

            if (resourceItem is null)
            {
                return (null, null);
            }

            var resourceId = resourceItem.ResourceId;

            var resultItem = IsMainResult(resourceId) ? CreateMainResultItem(resultChanged, resourceItem) : CreateEarlyResultItem(resultChanged, resourceItem);

            wrongResults.Add(resultItem.Item1);
            actualResults.Add(resultItem.Item2);
        }

        var result = (new CricketResult { CricketResultItems = wrongResults }, new CricketResult { CricketResultItems = actualResults });

        return (xmlConvertService.Serialize(result.Item1), xmlConvertService.Serialize(result.Item2));
    }

    public string CreateExtraInfo(List<ResultChanged> resultsChanged)
    {
        var extraInfoItems = resultsChanged.Select(x => new ExtraInfoItem
        {
            ResourceId = x.ResourceId,
            CalcDateTime = x.LogDate.ToString("yyyy-MM-dd HH:mm:ss.fff"),
            ReCalcDateTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff")
        }).ToList();

        var extraInfo = new ExtraInfo { ExtraInfoItems = extraInfoItems };

        return xmlConvertService.Serialize(extraInfo);
    }

    private (CricketResultItem, CricketResultItem) CreateMainResultItem(ResultChanged resultChanged, ResourceItem resourceItem)
    {
        return resultChanged.ResourceId == ResourceType.Final ? CreateResultItemBase(resultChanged, resourceItem) : CreateMainInningResultItem(resultChanged, resourceItem);
    }

    private (CricketResultItem, CricketResultItem) CreateMainInningResultItem(ResultChanged resultChanged, ResourceItem resourceItem)
    {
        var resourceId = resultChanged.ResourceId;
        var (itemChanged, itemSelected) = CreateResultItemBase(resultChanged, resourceItem);

        if (resourceId[..1] is "A" or "H")
        {
            var inning = resourceId.Substring(1, 1);
            var otherInfo = resourceId[..1] is "A" ? $"{resourceItem.AwayId}" : $"{resourceItem.HomeId}";

            itemChanged.MainGame = inning;
            itemChanged.OtherInfo = otherInfo;

            itemSelected.MainGame = inning;
            itemSelected.OtherInfo = otherInfo;

            return (itemChanged, itemSelected);
        }

        return (new CricketResultItem(), new CricketResultItem());
    }

    private (CricketResultItem, CricketResultItem) CreateEarlyResultItem(ResultChanged resultChanged, ResourceItem resourceItem)
    {
        var betTypeId = GetBetType(resultChanged.ResourceId);
        var (itemChanged, itemSelected) = CreateEarlyResultItemBase(resultChanged, resourceItem);

        if (PatternResultType.EarlyTypeOne.Contains(betTypeId))
        {
            ProcessTypeOne(itemChanged, itemSelected, resultChanged, resourceItem);
            return (itemChanged, itemSelected);
        }

        if (PatternResultType.EarlyTypeTwo.Contains(betTypeId))
        {
            return (itemChanged, itemSelected);
        }

        if (PatternResultType.EarlyTypeThree.Contains(betTypeId))
        {
            ProcessTypeThree(itemChanged, itemSelected, resultChanged, resourceItem);
            return (itemChanged, itemSelected);
        }

        return CreateEarlyFourResultItem(resultChanged, resourceItem);
    }

    private void ProcessTypeOne(CricketResultItem itemChanged, CricketResultItem itemSelected, ResultChanged resultChanged, ResourceItem resourceItem)
    {
        itemChanged.Home = NormalizeHomeValue(itemChanged.Home);
        itemChanged.TeamIds = GetTeamIds(resultChanged.HomeValue, resourceItem);

        itemSelected.Home = NormalizeHomeValue(itemSelected.Home);
        itemSelected.TeamIds = GetTeamIds(resourceItem.HomeValue, resourceItem);
    }

    private void ProcessTypeThree(CricketResultItem itemChanged, CricketResultItem itemSelected, ResultChanged resultChanged, ResourceItem resourceItem)
    {
        itemChanged.TeamIds = GetTeamIds(resultChanged.HomeValue, resourceItem);
        itemSelected.TeamIds = GetTeamIds(resourceItem.HomeValue, resourceItem);
    }

    private string NormalizeHomeValue(string homeValue) => homeValue == "N" ? "None" : homeValue;

    private string GetTeamIds(string value, ResourceItem resourceItem)
    {
        return value switch
        {
            "H" => $"{resourceItem.HomeId}",
            "A" => $"{resourceItem.AwayId}",
            _ => ""
        };
    }

    private (CricketResultItem, CricketResultItem) CreateEarlyFourResultItem(ResultChanged resultChanged, ResourceItem resourceItem)
    {
        var betTypeId = GetBetType(resultChanged.ResourceId);
        var inning = GetInning(resultChanged.ResourceId);

        var (itemChanged, itemSelected) = CreateEarlyResultItemBase(resultChanged, resourceItem);

        if (PatternResultType.EarlyTypeFourTwo.Contains(betTypeId))
        {
            itemChanged.MainGame = $"{inning}";
            itemSelected.MainGame = $"{inning}";

            return (itemChanged, itemSelected);
        }

        itemChanged.Game = $"{inning}";
        itemSelected.Game = $"{inning}";

        if (PatternResultType.EarlyTypeFour.Contains(betTypeId))
        {
            return (itemChanged, itemSelected);
        }

        if (PatternResultType.EarlyTypeFive.Contains(betTypeId))
        {
            itemChanged.TeamIds = $"{resultChanged.OtherInfo}";
            itemSelected.TeamIds = $"{resourceItem.OtherInfo}";

            return (itemChanged, itemSelected);
        }

        if (PatternResultType.EarlyTypeSix.Contains(betTypeId))
        {
            itemChanged.OtherInfo = $"{resultChanged.OtherInfo}";
            itemSelected.OtherInfo = $"{resourceItem.OtherInfo}";

            return (itemChanged, itemSelected);
        }

        return CreateEarlySevenResultItem(resultChanged, resourceItem);
    }

    private (CricketResultItem, CricketResultItem) CreateEarlySevenResultItem(ResultChanged resultChanged, ResourceItem resourceItem)
    {
        var betTypeId = GetBetType(resultChanged.ResourceId);
        var (itemChanged, itemSelected) = CreateEarlyResultItemBase(resultChanged, resourceItem);
        var otherInfo = $"{resourceItem.HomeId}";
        var inning = GetInning(resultChanged.ResourceId);

        if (PatternResultType.EarlyTypeSeven.Contains(betTypeId))
        {
            itemChanged.Game = $"{inning}";
            itemChanged.TeamIds = resultChanged.OtherInfo;
            itemChanged.OtherInfo = otherInfo;
            itemChanged.Home = itemChanged.Home == "N" ? "None" : itemChanged.Home;

            itemSelected.Game = $"{inning}";
            itemSelected.TeamIds = resourceItem.OtherInfo;
            itemSelected.OtherInfo = otherInfo;
            itemSelected.Home = itemSelected.Home == "N" ? "None" : itemSelected.Home;

            return (itemChanged, itemSelected);
        }

        return CreateEarlyIncludedOversResultItem(resultChanged, resourceItem);
    }

    private (CricketResultItem, CricketResultItem) CreateEarlyIncludedOversResultItem(ResultChanged resultChanged, ResourceItem resourceItem)
    {
        var betTypeId = GetBetType(resultChanged.ResourceId);
        var (itemChanged, itemSelected) = CreateEarlyResultItemBase(resultChanged, resourceItem);
        var inning = GetInning(resultChanged.ResourceId);
        var betTypeOvers = GetBetTypeOvers(resultChanged.ResourceId);

        itemChanged.Game = $"{inning}";
        itemChanged.X = $"{betTypeOvers}";

        itemSelected.Game = $"{inning}";
        itemSelected.X = $"{betTypeOvers}";

        if (CricketConstants.IncludedOvers.Contains(betTypeId))
        {
            return (itemChanged, itemSelected);
        }

        if (CricketConstants.IncludedOversAndBalls.Contains(betTypeId))
        {
            var betTypeBalls = GetBetTypeBalls(resultChanged.ResourceId);
            itemChanged.Y = $"{betTypeBalls}";
            itemSelected.Y = $"{betTypeBalls}";

            return (itemChanged, itemSelected);
        }

        return (new CricketResultItem(), new CricketResultItem());
    }

    private int GetBetType(string resourceId)
    {
        const int inningPosition = 4;
        return Convert.ToInt32(resourceId.Length < 5 ? resourceId : resourceId[..inningPosition]);
    }

    private (CricketResultItem, CricketResultItem) CreateResultItemBase(ResultChanged resultChanged, ResourceItem resourceItem)
    {
        var resourceId = resultChanged.ResourceId;
        var itemChanged = FromResultChanged(resultChanged, resourceId);
        var itemSelected = FromResourceItem(resourceItem, resourceId);

        return (itemChanged, itemSelected);
    }

    private (CricketResultItem, CricketResultItem) CreateEarlyResultItemBase(ResultChanged resultChanged, ResourceItem resourceItem)
    {
        var betTypeId = GetBetType(resultChanged.ResourceId);

        var itemChanged = FromResultChanged(resultChanged, $"{betTypeId}");
        var itemSelected = FromResourceItem(resourceItem, $"{betTypeId}");

        return (itemChanged, itemSelected);
    }

    private CricketResultItem FromResultChanged(ResultChanged resultChanged, string betTypeId)
    {
        var itemChanged = new CricketResultItem
        {
            ResourceId = resultChanged.ResourceId,
            Home = resultChanged.HomeValue,
            Away = resultChanged.AwayValue,
            RefBetTypeId = betTypeId
        };

        return itemChanged;
    }

    private CricketResultItem FromResourceItem(ResourceItem resourceItem, string betTypeId)
    {
        var itemChanged = new CricketResultItem
        {
            ResourceId = resourceItem.ResourceId,
            Home = resourceItem.HomeValue,
            Away = resourceItem.AwayValue,
            RefBetTypeId = betTypeId
        };

        return itemChanged;
    }

    private int GetInning(string resourceId)
    {
        var numberOfInnsPosition = 4;
        const int numberOfInnsLength = 1;
        if (resourceId.Length < 5)
        {
            numberOfInnsPosition = 1;
        }

        var numberOfInns = Convert.ToInt32(resourceId.Substring(numberOfInnsPosition, numberOfInnsLength));

        return numberOfInns;
    }

    private int GetBetTypeOvers(string resourceId)
    {
        const int overPosition = 5;
        const int overLength = 3;
        var betTypeOvers = Convert.ToInt32(resourceId.Substring(overPosition, overLength));

        return betTypeOvers;
    }

    private int GetBetTypeBalls(string resourceId)
    {
        const int ballPosition = 8;
        const int ballLength = 2;
        var betTypeOvers = Convert.ToInt32(resourceId.Substring(ballPosition, ballLength));

        return betTypeOvers;
    }

    private bool IsMainResult(string resourceId) => resourceId == ResourceType.Final || resourceId[..1] is "A" or "H";
}