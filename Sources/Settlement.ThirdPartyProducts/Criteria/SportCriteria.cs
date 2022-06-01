using Fanex.Data.Repository;
using System;

namespace Settlement.ThirdPartyProducts.Criteria
{
    public class SportCriteria : CriteriaBase
    {
        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_SportsSel_by_Vendor";
        }

        public override bool IsValid()
        {
            return FromDate <= ToDate;
        }
    }
}