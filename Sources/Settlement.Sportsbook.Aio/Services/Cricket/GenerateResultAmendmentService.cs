using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Fanex.Settlement.Converter.Services;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.ResourceInfos.Constants;
using Settlement.Sportsbook.Aio.Constants.Cricket;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Cricket;

public interface GenerateResultAmendmentService
{
    (string, string) CreateWrongActualResults(List<ResultChanged> resultsChanged, List<ResourceItem> selectedResources);

    string CreateExtraInfo(List<ResultChanged> resultsChanged);
}

public class GenerateResultAmendmentServiceImp : GenerateResultAmendmentService
{
    private readonly XmlConvertService xmlConvertService;

    public GenerateResultAmendmentServiceImp(XmlConvertService xmlConvertService)
    {
        this.xmlConvertService = xmlConvertService;
    }

    public (string, string) CreateWrongActualResults(List<ResultChanged> resultsChanged, List<ResourceItem> selectedResources)
    {
        var wrongResults = new List<CricketResultItem>();
        var actualResults = new List<CricketResultItem>();

        foreach (var resultChanged in resultsChanged)
        {
            var resourceItem = selectedResources.Find(x => x.ResourceId == resultChanged.ResourceId);

            if (resourceItem is null) return (null, null);

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
        var extraInfoItems = resultsChanged.Select(x =>
        {
            return new ExtraInfoItem
            {
                ResourceId = x.ResourceId,
                CalcDateTime = x.LogDate.ToString("yyyy-MM-dd HH:mm:ss.fff"),
                ReCalcDateTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"),
            };
        }).ToList();

        var extraInfo = new ExtraInfo { ExtraInfoItems = extraInfoItems };

        return xmlConvertService.Serialize(extraInfo);
    }

    private (CricketResultItem, CricketResultItem) CreateMainResultItem(ResultChanged resultChanged, ResourceItem resourceItem)
    {
        if (resultChanged.ResourceId == ResourceType.Final)
        {
            return CreateResultItemBase(resultChanged, resourceItem);
        }

        return CreateMainInningResultItem(resultChanged, resourceItem);
    }

    private (CricketResultItem, CricketResultItem) CreateMainInningResultItem(ResultChanged resultChanged, ResourceItem resourceItem)
    {
        var resourceId = resultChanged.ResourceId;
        var (itemChanged, itemSelected) = CreateResultItemBase(resultChanged, resourceItem);

        if (resourceId[..1] is "A" or "H")
        {
            var inning = resourceId.Substring(1, 1);
            var otherInfo = resourceId[..1] is "A" ? $"{resourceItem.AwayId}" : $"{resourceItem.HomeId}";

            itemChanged.Game = inning;
            itemChanged.OtherInfo = otherInfo;

            itemSelected.Game = inning;
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
            itemChanged.Game = "1";
            itemSelected.Game = "1";

            return (itemChanged, itemSelected);
        }

        if (PatternResultType.EarlyTypeTwo.Contains(betTypeId))
        {
            return (itemChanged, itemSelected);
        }

        if (PatternResultType.EarlyTypeThree.Contains(betTypeId))
        {
            itemChanged.TeamIds = resultChanged.HomeValue == "H" ? $"{resourceItem.HomeId}" : (resultChanged.HomeValue == "A" ? $"{resourceItem.AwayId}" : "");
            itemSelected.TeamIds = resourceItem.HomeValue == "H" ? $"{resourceItem.HomeId}" : (resourceItem.HomeValue == "A" ? $"{resourceItem.AwayId}" : "");

            return (itemChanged, itemSelected);
        }

        return CreateEarlyFourResultItem(resultChanged, resourceItem);
    }

    private (CricketResultItem, CricketResultItem) CreateEarlyFourResultItem(ResultChanged resultChanged, ResourceItem resourceItem)
    {
        var betTypeId = GetBetType(resultChanged.ResourceId);
        var inning = GetInning(resultChanged.ResourceId);

        var (itemChanged, itemSelected) = CreateEarlyResultItemBase(resultChanged, resourceItem);

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
        if (resourceId.Length < 5)
        {
            return Convert.ToInt32(resourceId);
        }

        return Convert.ToInt32(resourceId.Substring(0, 4));
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
            RefBetTypeId = betTypeId,
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
            RefBetTypeId = betTypeId,
        };

        return itemChanged;
    }

    private int GetInning(string resourceId)
    {
        var numberOfInnsPosition = 4;
        var numberOfInnsLength = 1;

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