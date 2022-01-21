using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criteria
{
    public class RefundCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public string Action { get; set; }

        public int AdminId { get; set; }

        public string Ip { get; set; }

        public string BetStatus { get; set; }

        public int? HalfTimeHome { get; set; }

        public int? HalfTimeAway { get; set; }

        public int? FullTimeHome { get; set; }

        public int? FullTimeAway { get; set; }

        public string ResourceResult { get; set; }

        public string GoalSequence { get; set; }

        public string ServiceCommand { get; set; }

        public byte SDTRecord { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Admin_Settlement_Refund_1_Push";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}