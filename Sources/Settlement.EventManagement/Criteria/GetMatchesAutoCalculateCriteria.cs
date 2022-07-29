using Fanex.Data.Repository;
using System;
using Fanex.Data;

namespace Settlement.EventManagement.Criteria
{
    public class GetMatchesAutoCalculateCriteria : CriteriaBase
    {
        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        public int SportType { get; set; }

        public int LeagueId { get; set; }

        public string MatchCode { get; set; }

        public byte StatusId { get; set; }

        public byte FilterBy { get; set; }

        public bool IsReLoad { get; set; }

        public bool IsHtOverOnly { get; set; }

        public bool IsOverOnly { get; set; }

        public bool IsInstant { get; set; }

        public string AutoSetting { get; set; }

        public bool IsMarkedTicket { get; set; }

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        public override string GetSettingKey()
        {
            return $"NAP_Set_AutoPayout_MatchSel_{DbServer}";
        }

        public override bool IsValid()
        {
            return FromDate <= ToDate;
        }
    }
}