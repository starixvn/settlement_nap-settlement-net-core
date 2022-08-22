using Fanex.Data.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Gaming.Criteria.Happy5
{
    class UpdateMatchCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public string Action { get; set; }

        public int AdminId { get; set; }

        public bool IsAuto { get; set; }

        public string Resources { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Admin_Match_s164_Upd";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}
