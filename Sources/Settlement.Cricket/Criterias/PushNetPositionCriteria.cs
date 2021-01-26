using Fanex.Data.Repository;
using System;

namespace Settlement.Sportsbook.Aio.Criterias
{
    public class PushNetPositionCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public int ServiceType { get; set; }

        public string Action { get; set; }

        public string ServiceCommand { get; set; }

        public byte ServiceStatus { get; set; }

        public string Reason { get; set; }

        public DateTime? StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Admin_Settlement_50";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}
