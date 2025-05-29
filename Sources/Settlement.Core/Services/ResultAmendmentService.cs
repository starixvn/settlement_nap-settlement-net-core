
using Settlement.Core.Constants;
using Fanex.Settlement.MessageBridge.ResultAmendment;
namespace Settlement.Core.Services;
public static class ResultAmendmentCoreService
{
    public static List<IGrouping<short, ResultChanged>> CheckReSettleTicket(IEnumerable<ResultChanged> results, string currentAction)
    {
        var resultsSetActionType = results.Select(x =>
        {
            x.ReSettleType = GetReSettleActionType(x.Action, currentAction);
            return x;
        });

        var resultsChangedGroupBy = resultsSetActionType
            .Where(x => x.ReSettleType != ReSettleType.UnKnow)
            .GroupBy(x => x.ReSettleType).ToList();

        return resultsChangedGroupBy;
    }

    private static short GetReSettleActionType(string beforeAction, string currentAction)
    {
        var before = beforeAction.ToUpperInvariant();
        var current = currentAction.ToUpperInvariant();

        if (before.Contains(ActionType.RefundAll) && current.Contains(ActionType.CalculateAll))
        {
            return ReSettleType.RefundToCalc;
        }

        if (before.Contains(ActionType.CalculateAll) && current.Contains(ActionType.RefundAll))
        {
            return ReSettleType.CalcToRefund;
        }

        if (before.Contains(ActionType.CalculateAll) && current.Contains(ActionType.CalculateAll))
        {
            return ReSettleType.ReCalc;
        }

        return ReSettleType.UnKnow;
    }
}
