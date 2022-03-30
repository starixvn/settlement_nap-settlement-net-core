using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criteria
{
    public class CheckingMarkedTicketsCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public string Action { get; set; }

        public bool IsExistMarkedTicket { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_CheckingMarkedTransaction";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}