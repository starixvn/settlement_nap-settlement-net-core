using Fanex.Data;
using Fanex.Data.Repository;
using System;

namespace Settlement.EventManagement.Criteria
{
    public class ParlayCriteria : NonQueryCommand
    {
        public string MatchIds { get; set; }

        public int AdminId { get; set; }

        public string Action { get; set; }

        public string Ip { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public string BroadcastSessionId { get; } = Guid.NewGuid().ToString();

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        public override string GetSettingKey() => $"CalculateMP_{DbServer}";

        public override bool IsValid() => AdminId > 0 && MatchIds.Length > 0;
    }
}