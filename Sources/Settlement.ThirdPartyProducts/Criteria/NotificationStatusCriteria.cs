using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.ThirdPartyProducts.Criteria
{
    public class NotificationStatusCriteria : CriteriaBase
    {
        public NotificationStatusCriteria(bool isBetBuilderStatus)
        {
            IsBetBuilderStatus = isBetBuilderStatus;
        }

        [SpParam(Ignored = true)]
        public bool IsBetBuilderStatus { get; set; }

        public override string GetSettingKey()
        {
            return "Nap_Set_MatchBetbuilderStatusSel";
        }

        public override bool IsValid()
        {
            return true;
        }
    }
}