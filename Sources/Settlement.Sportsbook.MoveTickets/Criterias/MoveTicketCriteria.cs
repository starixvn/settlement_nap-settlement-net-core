using Fanex.Data.Repository;

namespace Settlement.Sportsbook.MoveTickets.Criterias
{
    public class MoveTicketCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public int AdminId { get; set; }

        public string Ip { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Admin_Settlement_50_MoveTicket";
        }

        public override bool IsValid()
        {
            return AdminId > 0 && MatchId > 0;
        }
    }
}