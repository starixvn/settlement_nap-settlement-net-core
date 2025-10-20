using Settlement.Core.Constants;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.TableTennis;

public class ChildMatchService : IMapperService
{
    private const string totalPoints = "01";

    public Task Decorate(dynamic obj)
    {
        if (obj is Tuple<List<ChildMatchModel>, List<ResultDetail>> tuple)
        {
            var childMatchAfterFilter = VerifyChildMatches(tuple.Item1, tuple.Item2);

            tuple.Item1.Clear();
            tuple.Item1.AddRange(childMatchAfterFilter);
        }

        return Task.CompletedTask;
    }

    private static IEnumerable<ChildMatchModel> VerifyChildMatches(List<ChildMatchModel> childMatches, IEnumerable<ResultDetail> resultDetails)
    {
        var resourceIds = resultDetails.Select(x => x.ResourceId).ToArray();
        var totalPointMatch = childMatches.Where(x => x.RelatedResourceId == totalPoints);

        var newChildMatches = childMatches
            .Where(child => resourceIds.Contains(child.RelatedResourceId))
            .OrderBy(child => child.ChildMatchType)
            .Concat(totalPointMatch).ToList();

        foreach (var item in newChildMatches)
        {
            var isRefund = item.SettlementStatusId == SettlementStatus.Refund;

            item.HomeValue = isRefund ? "R" : item.HomeValue;
            item.AwayValue = isRefund ? "R" : item.AwayValue;
            item.NewEventStatus = isRefund ? "Refund" : item.EventStatus;
        }

        return newChildMatches;
    }
}