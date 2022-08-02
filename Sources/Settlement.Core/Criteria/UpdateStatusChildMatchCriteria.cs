using Fanex.Data.Repository;

namespace Settlement.Core.Criteria
{
    public class UpdateStatusChildMatchCriteria : NonQueryCommand
    {
        public int ParentId { get; set; }

        public string ChildMatchIds { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_AutoRefund_ResultIns";
        }

        public override bool IsValid()
        {
            return ParentId > 0;
        }
    }
}