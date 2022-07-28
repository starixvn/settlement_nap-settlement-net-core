using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Core.Criteria
{
    public class ValidateEventCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public string Action { get; set; }

        public string Mode { get; set; }

        public bool IsAuto { get; set; } = false;

        public string SelectedResources { get; set; }

        public string SpName { get; set; }

        public int SDTRecord { get; set; }

        public int SettleAbandonedMatchIBCParlay { get; set; }

        public bool IsSettleDetermined { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Admin_Settlement_Validation_Event";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}