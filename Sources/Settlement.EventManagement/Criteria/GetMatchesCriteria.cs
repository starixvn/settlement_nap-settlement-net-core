using Fanex.Data;
using Fanex.Data.Repository;
using System;

namespace Settlement.EventManagement.Criteria
{
    public class GetMatchesCriteria : CriteriaBase
    {
        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        public int SportType { get; set; }

        public int LeagueId { get; set; }

        public string MatchCode { get; set; }

        public byte StatusId { get; set; }

        public byte FilterBy { get; set; }

        public bool IsReLoad { get; set; }

        public bool AutoSettlementOnly { get; set; }

        public bool FastMarketsOnly { get; set; }
        
        public bool IsMarkedTicket { get; set; }

        public bool IsIncludeTest { get; set; }

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        public override string GetSettingKey()
        {
            return $"NAP_Set_MatchSel_{DbServer}";
        }

        public override bool IsValid()
        {
            return FromDate <= ToDate;
        }
    }
}