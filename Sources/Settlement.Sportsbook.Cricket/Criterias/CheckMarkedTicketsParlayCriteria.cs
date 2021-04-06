using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Cricket.Criterias
{
    public class CheckMarkedTicketsParlayCriteria : NonQueryCommand
    {
        private static readonly string RefundParlayAction = "MP_REFUND";

        public int MatchId { get; set; }

        public string Action { get; } = RefundParlayAction;

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