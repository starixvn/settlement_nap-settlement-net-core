using Settlement.Constants;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Volleyball;

public class ChildMatchService : IMapperService
{
    private const int Confirmed = 3;

    private const int Settled = 5;

    private const int BestOfMatch = 3;

    public void Decorate(dynamic obj)
    {
        if (obj is Tuple<List<ChildMatchModel>, List<ResultDetail>> tuple)
        {
            var childMatchAfterFilter = VerifyChildMatches(tuple.Item1, tuple.Item2);
            tuple.Item1.Clear();
            tuple.Item1.AddRange(childMatchAfterFilter);
        }
    }

    private static IEnumerable<ChildMatchModel> VerifyChildMatches(IEnumerable<ChildMatchModel> childMatches, IEnumerable<ResultDetail> resultDetails)
    {
        var finalResult = resultDetails.FirstOrDefault(item => item.ResourceId == ResourceType.Final);
        return childMatches.Where(item => !item.EventStatus.Equals(EventStatus.Completed, StringComparison.CurrentCultureIgnoreCase)
                                          && !item.ResultSettingData.IsConfirmedRefund
                                          && VerifyFinalResult(item, finalResult)).OrderBy(child => child.ChildMatchType).ToList();
    }

    private static bool VerifyFinalResult(ChildMatchModel childMatch, ResultDetail finalResult)
    {
        if (finalResult.ResultStatusId != Settled && finalResult.ResultStatusId != Confirmed)
        {
            return true;
        }
        var setCompleted = int.Parse(finalResult.HomeValue) + int.Parse(finalResult.AwayValue);
        return !finalResult.HomeValue.Equals(finalResult.AwayValue) &&
               int.Parse(finalResult.HomeValue) <= BestOfMatch && int.Parse(finalResult.AwayValue) <= BestOfMatch
               && ChildMatchConstant.ChildMatchValid[setCompleted].Contains(childMatch.ChildMatchType.ToString());
    }
}