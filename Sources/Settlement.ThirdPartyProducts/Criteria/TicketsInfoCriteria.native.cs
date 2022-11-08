using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.ThirdPartyProducts.Criteria
{
    public class TicketsInfoCriteria : CriteriaBase
    {
        public string MatchIds { get; set; }

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        public override string GetSettingKey()
        {
            return $"NAP_Set_MatchSel_by_Vendor_Ticket_{DbServer}";
        }

        public override bool IsValid()
        {
            return MatchIds.Length > 0;
        }
    }
}