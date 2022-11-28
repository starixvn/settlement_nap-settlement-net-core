using Settlement.Core.Constants;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Volleyball;

public class ChildMatchService : IMapperService
{
    private readonly int confirmed = 3;

    private readonly int setted = 5;

    private readonly int bestOfMatch = 3;

    public void Decorate(dynamic obj)
    {
        var tuple = obj as Tuple<List<ChildMatchModel>, List<ResultDetail>>;
        var childMatchAfterFilter = VerifyChildMatches(tuple.Item1, tuple.Item2);
        tuple.Item1.Clear();
        tuple.Item1.AddRange(childMatchAfterFilter);
    }

    private List<ChildMatchModel> VerifyChildMatches(List<ChildMatchModel> childMatches, List<ResultDetail> resultDetails)
    {
        var finalResult = resultDetails.FirstOrDefault(item => item.ResourceId == ResourceType.Final);
        return childMatches.Where(item => !item.EventStatus.Equals(EventStatus.Completed, StringComparison.CurrentCultureIgnoreCase)
                                          && !item.ResultSettingData.IsConfirmedRefund
                                          && VerifyFinalResult(item, finalResult)).OrderBy(child => child.ChildMatchType).ToList();
    }

    private bool VerifyFinalResult(ChildMatchModel childMatch, ResultDetail finalResult)
    {
        if (finalResult.ResultStatusId == setted || finalResult.ResultStatusId == confirmed)
        {
            var setCompleted = int.Parse(finalResult.HomeValue) + int.Parse(finalResult.AwayValue);
            return !finalResult.HomeValue.Equals(finalResult.AwayValue) &&
                int.Parse(finalResult.HomeValue) <= bestOfMatch && int.Parse(finalResult.AwayValue) <= bestOfMatch
                && ChildMatchConstant.ChildMatchValid[setCompleted].Contains(childMatch.ChildMatchType.ToString());
        }

        return true;
    }
}