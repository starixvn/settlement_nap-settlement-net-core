using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Aio.Criterias
{
    public class CheckMarkedTicketsCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public string ResourceIds { get; set; }

        public bool IsExistMarkedTicket { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_EarlySettlement_CheckingMarkedTransaction";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}