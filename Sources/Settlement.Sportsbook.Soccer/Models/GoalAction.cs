using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Settlement.Core.Constants;

namespace Settlement.Sportsbook.Soccer.Models
{
    public class GoalAction
    {
        public string FirstGoal { get; set; }

        public string LastGoal { get; set; }

        public bool IsRefund => IsRefundAction(FirstGoalSettlementStatusId) || IsRefundAction(LastGoalSettlementStatusId);

        public int FirstGoalSettlementStatusId { get; set; }

        public int LastGoalSettlementStatusId { get; set; }

        private static bool IsRefundAction(int settlementStatusId)
        {
            var refund = settlementStatusId == SettlementStatus.Refund
                         || settlementStatusId == SettlementStatus.RefundHT
                         || settlementStatusId == SettlementStatus.RefundFT;

            var abandoned = settlementStatusId == SettlementStatus.Abandoned1H || settlementStatusId == SettlementStatus.Abandoned2H;

            return refund || abandoned;
        }
    }
}