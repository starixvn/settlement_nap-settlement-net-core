using Fanex.Data.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Gaming.Criteria.Happy5
{
    class ValidateEventCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public string Action { get; set; }

        public bool IsAuto { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Admin_Settlement_s164_Validation_Event";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}
