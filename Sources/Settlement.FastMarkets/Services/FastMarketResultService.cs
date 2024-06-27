using Settlement.Core.Models;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Models.BetTypeModels;
using Settlement.FastMarkets.Models.TimeMachineOldResult;

namespace Settlement.FastMarkets.Services;

public interface IFastMarketResultService
{
    string Result(List<BetType> betTypeList, string action);

    Task<string> OldResults(List<BetType> betTypes, int matchId);
}

public class FastMarketResultServiceImp(
    IBetTypeElementService betTypeElementService,
    XmlConvertService xmlConvertService,
    IDynamicRepository repository)
    : IFastMarketResultService
{
    public string Result(List<BetType> betTypeList, string action)
    {
        var betType = betTypeElementService.GetBetTypes(betTypeList, action);
        var betTypesRoot = new BetTypesRoot
        {
            BetType = betType
        };

        return xmlConvertService.Serialize(betTypesRoot);
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
            oldResults = new List<OldResult>();
        }

        if (oldResults.Any())
        {
            return GenerateOldResultsResource(oldResults);
        }

        return string.Empty;
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
            OldResultElements = new List<OldResultElement> { resultElement }
        };

        return xmlConvertService.Serialize(resultRoot);
    }
}