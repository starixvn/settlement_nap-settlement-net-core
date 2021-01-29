using Fanex.Data.Repository;
using Microsoft.AspNetCore.Http;

namespace Settlement.Sportsbook.Aio.Criterias
{
    public class SettleCriteria : NonQueryCommand
    {
        private static readonly HttpContext context;
        public int AdminId { get; set; }

        public int MatchId { get; set; }

        public string SelectedResources { get; set; }

        public string Action { get; set; }

        public string Ip { get; } = context.Connection.RemoteIpAddress.ToString();

        public bool IsReSettledTickets { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public string Command { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Admin_Settlement_Profile_Push";
        }

        public override bool IsValid()
        {
            return AdminId > 0 && MatchId > 0;
        }
    }
}