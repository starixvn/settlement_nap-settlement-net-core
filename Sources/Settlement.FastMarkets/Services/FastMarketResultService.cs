using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.FastMarkets.Constants;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Models.BetTypeModels;
using Settlement.FastMarkets.Models.TimeMachineOldResult;
using BetType = Settlement.FastMarkets.Models.BetType;
using ResourceItem = Fanex.Settlement.MessageBridge.ResultAmendment.ResourceItem;

namespace Settlement.FastMarkets.Services;

public interface IFastMarketResultService
{
    XMLResult<BetTypeElement> Result(List<BetType> betTypeList, string action);

    Task<string> OldResults(List<BetType> betTypes, int matchId);

    IEnumerable<ResourceItem> CreateResourcesFromBetType(BetTypeElement betType, string action, bool isSettleDetermined);
}

public class FastMarketResultServiceImp(
    IBetTypeElementService betTypeElementService,
    XmlConvertService xmlConvertService,
    IDynamicRepository repository)
    : IFastMarketResultService
{
    private const short TimeMachineHandicapScoreRange = 10;

    public XMLResult<BetTypeElement> Result(List<BetType> betTypeList, string action)
    {
        var betType = betTypeElementService.GetBetTypes(betTypeList, action);
        var betTypesRoot = new BetTypesRoot
        {
            BetType = betType
        };

        return new XMLResult<BetTypeElement>
        {
            OriginalItems = betType,
            Result = xmlConvertService.Serialize(betTypesRoot)
        };
    }

    public async Task<string> OldResults(List<BetType> betTypes, int matchId)
    {
        var criteria = new GetFastMarketMatchDetailCriteria { MatchId = matchId };
        var fetchedData = await repository.FetchMultipleAsync<EventCounter, string, OldResult, ResultDetail>(criteria);
        var oldResults = fetchedData.Item3.Where(result => result.BetType == 228).ToList();
        var timeMachineBetType = betTypes.Find(betType => betType.BetTypeId == 228);
        var accumulatedScore = 0;
        foreach (var result in oldResults)
        {
            var settledStatuses = new List<int> { 4, 5, 7 };
            if (settledStatuses.Contains(result.ResultStatus))
            {
                accumulatedScore += result.Result;
            }

            result.AccumulatedResult = accumulatedScore;
        }

        if (timeMachineBetType != null)
        {
            var timeMachineOuResults = timeMachineBetType.FastMarketResults;
            oldResults = oldResults.Where(result => timeMachineOuResults.Exists(r => r.BetType == result.BetType && r.Position == result.Position)).ToList();
        }
        else
        {
            oldResults = [];
        }

        return oldResults.Any() ? GenerateOldResultsResource(oldResults) : string.Empty;
    }


    public IEnumerable<ResourceItem> CreateResourcesFromBetType(BetTypeElement betType, string action, bool isSettleDetermined)
    {
        if (action == ActionType.RefundAll && !isSettleDetermined)
        {
            return betType.Items.Select(item => new ResourceItem
            {
                ResourceId = betType.Id.ToString(),
                OtherInfo = item.Position.ToString()
            });
        }

        if (betType.Id == FastMarketBetType.TimeMachineHdp)
        {
            return betType.Items.Select(item => new ResourceItem
            {
                ResourceId = betType.Id.ToString(),
                OtherInfo = item.Position.ToString(),
                HomeValue = (Convert.ToInt32(item.Result) % TimeMachineHandicapScoreRange).ToString(),
                AwayValue = (Convert.ToInt32(item.Result) / TimeMachineHandicapScoreRange).ToString()
            });
        }

        return betType.Items.Select(item => new ResourceItem
        {
            ResourceId = betType.Id.ToString(),
            OtherInfo = item.Position.ToString(),
            HomeValue = item.Result
        });
    }

    private string GenerateOldResultsResource(List<OldResult> oldResults)
    {
        var resultElement = new OldResultElement
        {
            BetTypeId = 228,
            Results = oldResults
        };

        var resultRoot = new OldResultRoot
        {
            OldResultElements = [resultElement]
        };

        return xmlConvertService.Serialize(resultRoot);
    }
}