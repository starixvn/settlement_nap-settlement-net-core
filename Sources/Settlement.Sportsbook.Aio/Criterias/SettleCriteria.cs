using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Aio.Criterias
{
    public class SettleCriteria : NonQueryCommand
    {
        public int AdminId { get; set; }

        public int MatchId { get; set; }

        public string SelectedResources { get; set; }

        public string Action { get; set; }

        public string Ip { get; set; }

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