using Fanex.Data.Repository;
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

public class FastMarketResultServiceImp : IFastMarketResultService
{
    private readonly IBetTypeElementService betTypeElementService;

    private readonly XmlConvertService xmlConvertService;

    private readonly IDynamicRepository repository;

    public FastMarketResultServiceImp(IBetTypeElementService betTypeElementService, XmlConvertService xmlConvertService,
        IDynamicRepository repository)
    {
        this.betTypeElementService = betTypeElementService;
        this.xmlConvertService = xmlConvertService;
        this.repository = repository;
    }

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
        var mappingTypes = new[] { typeof(EventCounter), typeof(string), typeof(OldResult), typeof(ResultDetail) };
        var fetchedData = await repository.FetchMultipleAsync(criteria, mappingTypes);
        var oldResults = fetchedData[2].Cast<OldResult>().Where(result => result.BetType == 228).ToList();
        var timeMachineBetType = betTypes.FirstOrDefault(betType => betType.BetTypeId == 228);
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
            oldResults = oldResults.Where(result => timeMachineOuResults.Any(r => r.BetType == result.BetType && r.Position == result.Position)).ToList();
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
            oldResultElements = new List<OldResultElement> { resultElement }
        };

        return xmlConvertService.Serialize(resultRoot);
    }
}