using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.ResourceInfos.Constants;
using Settlement.Sportsbook.Aio.Constants.Cricket;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Criteria.Cricket;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Cricket;

public interface ResultAmendmentService
{
    Task HandleResultAmendment(SettleCriteria settleCriteria, List<ResourceItem> selectedResources);
}

public class ResultAmendmentServiceImp : ResultAmendmentService
{
    private readonly IDynamicRepository _repository;
    private readonly XmlConvertService xmlConvertService;
    private readonly AppSettingsKey _appSettingsKey;

    public ResultAmendmentServiceImp(IDynamicRepository repository,
        XmlConvertService xmlConvertService,
        IOptions<AppSettingsKey> appSettingsKey)
    {
        _repository = repository;
        this.xmlConvertService = xmlConvertService;
        _appSettingsKey = appSettingsKey.Value;
    }

    public async Task HandleResultAmendment(SettleCriteria settleCriteria, List<ResourceItem> selectedResources)
    {
        var criteria = new CheckReSettleCriteria
        {
            MatchId = settleCriteria.MatchId,
            SelectedResources = settleCriteria.SelectedResources,
            Action = settleCriteria.Action
        };

        var resultsChanged = await CheckReSettleTicket(criteria);

        if (resultsChanged.Count == 0)
        {
            return;
        }

        SetReSettleActionType(settleCriteria.Action, resultsChanged);

        var resultsChangedGroupBy = resultsChanged.GroupBy(x => x.ReSettleType);

        var resultHistoryItems = resultsChangedGroupBy.Select((item, index) => CreateResultHistoryItem(item.ToList(), selectedResources, item.Key, index + 1));

        var resultHistoryInsCriteria = CreateResultHistoryInsCriteria(settleCriteria, resultHistoryItems.ToList());

        CreateResultHistory(resultHistoryInsCriteria);
    }

    private async Task<List<ResultChanged>> CheckReSettleTicket(CheckReSettleCriteria criteria)
    {
        var results = await _repository.FetchAsync<ResultChanged>(criteria);

        return results.ToList();
    }

    private void CreateResultHistory(ResultHistoryInsCriteria resultHistoryInsCriteria)
    {
        foreach (var server in _appSettingsKey.SiteDbServer.Where(x => x != "DBTXN"))
        {
            resultHistoryInsCriteria.DbServer = server;
            _repository.Execute(resultHistoryInsCriteria);
        }
    }

    private ResultHistoryInsCriteria CreateResultHistoryInsCriteria(SettleCriteria settleCriteria, List<ResultHistoryItem> resultHistoryItems)
    {
        var criteria = new ResultHistoryInsCriteria();
        criteria.MatchId = settleCriteria.MatchId;
        criteria.SessionID = settleCriteria.BroadcastSessionId;
        criteria.SportType = settleCriteria.SportType;

        criteria.ResourceInfo = CreateResourceInfo(resultHistoryItems);

        return criteria;
    }

    private (CricketResult, CricketResult) CreateWrongActualResults(List<ResultChanged> resultsChanged, List<ResourceItem> selectedResources)
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

        return (new CricketResult { CricketResultItems = wrongResults }, new CricketResult { CricketResultItems = actualResults });
    }

    private bool IsMainResult(string resourceId)
    {
        return resourceId == ResourceType.Final || resourceId[..1] is "A" or "H";
    }

    private ResultHistoryItem CreateResultHistoryItem(List<ResultChanged> resultsChanged, List<ResourceItem> selectedResources, int actionType, int seqNo)
    {
        var wrongActualResults = CreateWrongActualResults(resultsChanged, selectedResources);
        var wrongResultStr = xmlConvertService.Serialize(wrongActualResults.Item1);
        var actualResultStr = xmlConvertService.Serialize(wrongActualResults.Item2);

        var extraInfo = CreateExtraInfo(resultsChanged);
        var extraInfoStr = xmlConvertService.Serialize(extraInfo);

        var resultHistoryItem = new ResultHistoryItem
        {
            SeqNo = seqNo,
            WrongResult = wrongResultStr,
            ActualResult = actualResultStr,
            ExtraInfo = extraInfoStr,
            ActionType = actionType,
        };

        return resultHistoryItem;
    }

    private ExtraInfo CreateExtraInfo(List<ResultChanged> resultsChanged)
    {
        var extraInfoItems = resultsChanged.Select(x =>
        {
            return new ExtraInfoItem
            {
                ResourceId = x.ResourceId,
                ReCalcDateTime = x.LogDate.ToString("yyyy-MM-dd HH:mm:ss.fff"),
                CalcDateTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"),
            };
        }).ToList();

        return new ExtraInfo
        {
            ExtraInfoItems = extraInfoItems
        };
    }

    private void SetReSettleActionType(string currentAction, List<ResultChanged> resultsChanged)
    {
        resultsChanged.ForEach(x =>
        {
            x.ReSettleType = GetReSettleActionType(x.Action, currentAction);
        });
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
            itemChanged.TeamIds = resultChanged.OtherInfo;
            itemSelected.TeamIds = resourceItem.OtherInfo;

            return (itemChanged, itemSelected);
        }

        if (PatternResultType.EarlyTypeSix.Contains(betTypeId))
        {
            itemChanged.OtherInfo = resultChanged.OtherInfo;
            itemSelected.OtherInfo = resourceItem.OtherInfo;

            return (itemChanged, itemSelected);
        }

        return CreateEarlySevenResultItem(resultChanged, resourceItem);
    }

    private (CricketResultItem, CricketResultItem) CreateEarlySevenResultItem(ResultChanged resultChanged, ResourceItem resourceItem)
    {
        var betTypeId = GetBetType(resultChanged.ResourceId);
        var (itemChanged, itemSelected) = CreateEarlyResultItemBase(resultChanged, resourceItem);
        var otherInfo = $"{resourceItem.HomeId},{resourceItem.AwayId}";
        var inning = GetInning(resultChanged.ResourceId);

        if (PatternResultType.EarlyTypeSeven.Contains(betTypeId))
        {
            itemChanged.Game = $"{inning}";
            itemChanged.TeamIds = resultChanged.OtherInfo;
            itemChanged.OtherInfo = otherInfo;

            itemSelected.Game = $"{inning}";
            itemSelected.TeamIds = resourceItem.OtherInfo;
            itemChanged.OtherInfo = otherInfo;

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

    private short GetReSettleActionType(string beforeAction, string currentAction)
    {
        if (beforeAction == "Refund")
        {
            return 3;
        }

        if (currentAction == "Refund")
        {
            return 2;
        }

        return 1;
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

    private string CreateResourceInfo(List<ResultHistoryItem> resultHistoryItems)
    {
        var json = JsonSerializer.Serialize(resultHistoryItems);

        return json;
    }
}