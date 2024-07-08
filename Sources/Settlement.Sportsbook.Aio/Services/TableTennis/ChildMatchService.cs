using Settlement.Constants;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.TableTennis;

public class ChildMatchService : IMapperService
{
    public void Decorate(dynamic obj)
    {
        if (obj is Tuple<List<ChildMatchModel>, List<ResultDetail>> tuple)
        {
            var childMatchAfterFilter = VerifyChildMatches(tuple.Item1);

            tuple.Item1.Clear();
            tuple.Item1.AddRange(childMatchAfterFilter);
        }
    }

    private static IEnumerable<ChildMatchModel> VerifyChildMatches(IEnumerable<ChildMatchModel> childMatches)
    {
        var newChildMatches = childMatches.OrderBy(child => child.ChildMatchType).ToList();

        foreach (var item in newChildMatches)
        {
            if (item.SettlementStatusId == SettlementStatus.Refund)
            {
                item.HomeValue = "R";
                item.AwayValue = "R";
            }
        }

        return newChildMatches;
    }
}