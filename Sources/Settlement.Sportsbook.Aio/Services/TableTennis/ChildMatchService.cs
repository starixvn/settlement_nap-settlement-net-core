using Settlement.Core.Constants;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.TableTennis;

public class ChildMatchService : IMapperService
{
    private const int Confirmed = 3;

    private const int Settled = 5;

    private const int BestOfMatch = 3;

    public void Decorate(dynamic obj)
    {
        if (obj is Tuple<List<ChildMatchModel>, List<ResultDetail>> tuple)
        {
            var finalResult = tuple.Item2.FirstOrDefault(item => item.ResourceId == ResourceType.Final);
            var childMatchAfterFilter = tuple.Item1.Where(item => VerifyFinalResult(item, finalResult)).OrderBy(child => child.ChildMatchType).ToList();

            tuple.Item1.Clear();
            tuple.Item1.AddRange(childMatchAfterFilter);
        }
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