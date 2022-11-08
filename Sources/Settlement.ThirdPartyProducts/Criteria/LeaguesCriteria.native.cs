using Fanex.Data.Repository;
using System;

namespace Settlement.ThirdPartyProducts.Criteria
{
    public class LeaguesCriteria : CriteriaBase
    {
        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        public string SportTypes { get; set; }

        public override string GetSettingKey()
        {
            return "Nap_Set_LeagueSel_by_Vendor";
        }

        public override bool IsValid()
        {
            return FromDate <= ToDate;
        }
    }
}