using System.Text.Json;
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

    public ResultAmendmentServiceImp(IDynamicRepository repository, XmlConvertService xmlConvertService)
    {
        _repository = repository;
        this.xmlConvertService = xmlConvertService;
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

        //TODO
        var resultHistoryInsCriteria = CreateResultHistoryInsCriteria(settleCriteria, selectedResources, resultsChanged);

        await CreateResultHistory(resultHistoryInsCriteria);
    }

    public async Task<List<ResultChanged>> CheckReSettleTicket(CheckReSettleCriteria criteria)
    {
        var results = await _repository.FetchAsync<ResultChanged>(criteria);

        return results.ToList();
    }

    public List<CricketResultItem> CreateCricketResults(List<ResultChanged> resultsChanged)
    {
        var result = resultsChanged.Select(x => CreateResult(x)).ToList();
        return result;
    }

    private async Task CreateResultHistory(ResultHistoryInsCriteria resultHistoryInsCriteria)
    {
        await _repository.ExecuteAsync(resultHistoryInsCriteria);
    }

    private ResultHistoryInsCriteria CreateResultHistoryInsCriteria(SettleCriteria settleCriteria, List<ResourceItem> selectedResources, List<ResultChanged> resultsChanged)
    {
        var criteria = new ResultHistoryInsCriteria();
        criteria.MatchId = settleCriteria.MatchId;
        criteria.SessionID = settleCriteria.BroadcastSessionId;
        criteria.SportType = settleCriteria.SportType;

        criteria.ResourceInfo = CreateResourceInfo(selectedResources, resultsChanged);

        return criteria;
    }

    private string CreateResourceInfo(List<ResourceItem> selectedResources, List<ResultChanged> resultsChanged)
    {
        var resultHistoryItem = CreateResultHistoryItem(selectedResources, resultsChanged);

        var resultHistoryItems = new List<ResultHistoryItem>
        {
            resultHistoryItem
        }; // actionType 1 , 2 , 3

        var json = JsonSerializer.Serialize(resultHistoryItems);

        return json;
    }

    private ResultHistoryItem CreateResultHistoryItem(List<ResourceItem> selectedResources, List<ResultChanged> resultsChanged)
    {
        var extraInfo = CreateExtraInfo(resultsChanged);
        var extraInfoStr = xmlConvertService.Serialize(extraInfo);

        var wrongResult = CreateCricketResultAmendment(resultsChanged);
        var wrongResultStr = xmlConvertService.Serialize(wrongResult);

        var actualResult = CreateCricketResultAmendment(selectedResources.Select(x => ConvertToResultChanged(x)).ToList());
        var actualResultStr = xmlConvertService.Serialize(wrongResult);

        var resultHistoryItem = new ResultHistoryItem
        {
            SeqNo = 1,
            WrongResult = wrongResultStr,
            ActualResult = actualResultStr,
            ExtraInfo = extraInfoStr,
            ActionType = 1,
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
                ReCalcDateTime = x.LogDate.ToString(),
                CalcDateTime = DateTime.Now.ToString(),
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

    private CricketResultItem CreateResult(ResultChanged resultChanged)
    {
        // main
        var resultItem = CreateCricketMainResultItem(resultChanged);

        // early

        return resultItem;
    }

    private CricketResultItem CreateEarlyResults(ResultChanged resultChanged)
    {
        var betTypeId = GetBetType(resultChanged.ResourceId);
        if (betTypeId is 9442 or 9443) //E1
        {
            return new CricketResultItem
            {
                ResourceId = resultChanged.ResourceId,
                Home = resultChanged.HomeValue,
                RefBetTypeId = resultChanged.ResourceId,
                Game = "1"
            };
        }

        if (GroupBetType.MatchBetType.Contains(betTypeId)) //E2
        {
            return new CricketResultItem
            {
                ResourceId = resultChanged.ResourceId,
                Home = resultChanged.HomeValue,
                RefBetTypeId = resultChanged.ResourceId,
            };
        }

        if (betTypeId is 9401 or 9400) //E3
        {
            return new CricketResultItem
            {
                ResourceId = resultChanged.ResourceId,
                Home = resultChanged.HomeValue,
                RefBetTypeId = resultChanged.ResourceId,
                TeamId = resultChanged.OtherInfo
            };
        }

        var e4 = new List<int> { 9708, 9709, 9615, 9451, 9454, 9455, 9460, 9461 };
        if (e4.Contains(betTypeId))
        {
            var inning = GetInning(resultChanged.ResourceId);
            return new CricketResultItem
            {
                ResourceId = resultChanged.ResourceId,
                Home = resultChanged.HomeValue,
                Away = resultChanged.AwayValue,
                RefBetTypeId = $"{betTypeId}",
                Game = $"{inning}"
            };
        }

        var e5 = new List<int> { 9668, 9650, 9672, 9656, 9671, 9651, 9675, 9657 };
        if (e5.Contains(betTypeId))
        {
            var inning = GetInning(resultChanged.ResourceId);
            return new CricketResultItem
            {
                ResourceId = resultChanged.ResourceId,
                Home = resultChanged.HomeValue,
                Away = resultChanged.AwayValue,
                RefBetTypeId = $"{betTypeId}",
                Game = $"{inning}",
                //TeamId = resultChanged.OtherInfo
            };
        }

        var e6 = new List<int> { 9676, 9680, 9736, 9730, 9690, 9737, 9731 };
        if (e6.Contains(betTypeId))
        {
            var inning = GetInning(resultChanged.ResourceId);
            return new CricketResultItem
            {
                ResourceId = resultChanged.ResourceId,
                Home = resultChanged.HomeValue,
                Away = resultChanged.AwayValue,
                RefBetTypeId = $"{betTypeId}",
                Game = $"{inning}",
                OtherInfo = resultChanged.OtherInfo
            };
        }

        if (GroupBetType.IncludedTwoPlayerName.Contains(betTypeId))
        {
            var inning = GetInning(resultChanged.ResourceId);
            return new CricketResultItem
            {
                ResourceId = resultChanged.ResourceId,
                Home = resultChanged.HomeValue,
                Away = resultChanged.AwayValue,
                RefBetTypeId = $"{betTypeId}",
                Game = $"{inning}",
                OtherInfo = resultChanged.OtherInfo,
                TeamId = resultChanged.TeamId
            };
        }

        if (CricketConstants.IncludedOvers.Contains(betTypeId))
        {
            var inning = GetInning(resultChanged.ResourceId);
            var betTypeOvers = GetBetTypeOvers(resultChanged.ResourceId);

            return new CricketResultItem
            {
                ResourceId = resultChanged.ResourceId,
                Home = resultChanged.HomeValue,
                Away = resultChanged.AwayValue,
                RefBetTypeId = $"{betTypeId}",
                Game = $"{inning}",
                X = $"{betTypeOvers}",
            };
        }

        if (CricketConstants.IncludedOversAndBalls.Contains(betTypeId))
        {
            var inning = GetInning(resultChanged.ResourceId);
            var betTypeOvers = GetBetTypeOvers(resultChanged.ResourceId);
            var betTypeBalls = GetBetTypeBalls(resultChanged.ResourceId);

            return new CricketResultItem
            {
                ResourceId = resultChanged.ResourceId,
                Home = resultChanged.HomeValue,
                Away = resultChanged.AwayValue,
                RefBetTypeId = $"{betTypeId}",
                Game = $"{inning}",
                X = $"{betTypeOvers}",
                Y = $"{betTypeBalls}"
            };
        }
        return new CricketResultItem();
    }

    private int GetInning(string resourceId)
    {
        const int numberOfInnsPosition = 4;
        const int numberOfInnsLength = 1;
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

    private CricketResult CreateCricketResultAmendment(List<ResultChanged> resultsChanged)
    {
        var items = resultsChanged.Select(x => CreateResult(x)).ToList();

        return new CricketResult
        {
            CricketResultItems = items
        };
    }

    private CricketResultItem CreateCricketMainResultItem(ResultChanged resultChanged)
    {
        var resourceId = resultChanged.ResourceId;

        if (resourceId == ResourceType.Final)
        {
            return new CricketResultItem
            {
                ResourceId = resultChanged.ResourceId,
                Home = resultChanged.HomeValue,
                Away = resultChanged.AwayValue,
                RefBetTypeId = resultChanged.ResourceId
            };
        }

        if (resourceId[..1] is "A" or "H")
        {
            var inningNumber = resourceId.Substring(1, 1);

            return new CricketResultItem
            {
                ResourceId = resultChanged.ResourceId,
                Home = resultChanged.HomeValue,
                Away = resultChanged.AwayValue,
                RefBetTypeId = resultChanged.ResourceId,
                OtherInfo = resultChanged.OtherInfo,
                Game = inningNumber
            };
        }

        return new CricketResultItem();
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

    private ResultChanged ConvertToResultChanged(ResourceItem resourceItem)
    {
        var resultChanged = new ResultChanged
        {
            ResourceId = resourceItem.ResourceId,
            HomeValue = resourceItem.HomeValue,
            AwayValue = resourceItem.AwayValue,
            OtherInfo = resourceItem.OtherInfo,
            TeamId = resourceItem.TeamId,
        };

        return resultChanged;
    }
}