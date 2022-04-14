using System;
using Fanex.Data.Repository;

namespace Settlement.EventManagement.Criteria
{
    public class SportCriteria : CriteriaBase
    {
        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_OtherSportsSel";
        }

        public override bool IsValid()
        {
            return FromDate <= ToDate;
        }
    }
}