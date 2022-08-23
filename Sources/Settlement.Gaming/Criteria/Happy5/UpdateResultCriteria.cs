using Fanex.Data.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Gaming.Criteria.Happy5
{
    public class UpdateResultCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public string Action { get; set; }

        public int AdminId { get; set; }

        public bool IsAuto { get; set; }

        public string Resources { get; set; }

        public int SportType = 164;

        public override string GetSettingKey()
        {
            return "NAP_Admin_Result_Update_BingoBall";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}
