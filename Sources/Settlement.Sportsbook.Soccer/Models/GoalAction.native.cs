using Settlement.Core.Constants;

namespace Settlement.Sportsbook.Soccer.Models;

public class GoalAction
{
    public string FirstGoal { get; set; }

    public string LastGoal { get; set; }

    public bool IsRefund => IsRefundAction(FirstGoalSettlementStatusId) || IsRefundAction(LastGoalSettlementStatusId);

    public int FirstGoalSettlementStatusId { get; set; }

    public int LastGoalSettlementStatusId { get; set; }

    private static bool IsRefundAction(int settlementStatusId)
    {
        var refund = settlementStatusId is SettlementStatus.Refund or SettlementStatus.RefundHt or SettlementStatus.RefundFt;

        var abandoned = settlementStatusId is SettlementStatus.Abandoned1H or SettlementStatus.Abandoned2H;

        return refund || abandoned;
    }
}