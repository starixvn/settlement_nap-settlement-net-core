using Fanex.Data;
using Fanex.Data.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.EventManagement.Criteria
{
    public class ValidateTicketParlayCriteria : NonQueryCommand
    {
        public string MatchIds { get; set; }

        public string Action { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public string MatchIdsValid { get; set; }

        public string MatchIdsInvalid { get; set; }

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        public override string GetSettingKey()
        {
            return $"NAP_Admin_Settlement_Validation_MP_Ticket_{DbServer}";
        }

        public override bool IsValid()
        {
            return MatchIds.Length > 0;
        }
    }
}
