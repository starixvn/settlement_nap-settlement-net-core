using System;
using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Aio.Criteria
{
    public class SettleCriteria : NonQueryCommand
    {
        private string childMatchIds;

        public int AdminId { get; set; }

        public int MatchId { get; set; }

        public string SelectedResources { get; set; }

        public string Action { get; set; }

        public string Ip { get; set; }

        public bool IsReSettledTickets { get; set; }

        public bool IsLeader { get; set; }

        public string BetStatus { get; set; }

        public bool IsDirectly { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public string ServiceCommand { get; set; }

        public int? RefResultStatus { get; set; }

        public string BroadcastSessionId { get; } = Guid.NewGuid().ToString();

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        [SpParam(Ignored = true)]
        public string SpName { get; } = "NAP_Admin_Settlement_Profile_Push";

        public string ChildMatchIds
        {
            get
            {
                return string.IsNullOrEmpty(childMatchIds) ? "0" : childMatchIds;
            }
            set
            {
                childMatchIds = value;
            }
        }

        public override string GetSettingKey() => $"NAP_Admin_Settlement_Profile_Push_{DbServer}";

        public override bool IsValid() => AdminId > 0 && MatchId > 0;
    }
}