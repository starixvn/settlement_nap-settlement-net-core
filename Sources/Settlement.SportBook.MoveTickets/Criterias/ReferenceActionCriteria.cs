using Fanex.Data.Repository;

namespace Settlement.Sportsbook.MoveTickets.Criterias
{
    public class ReferenceActionCriteria : CriteriaBase
    {
        public string MatchIds { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_MoveTicket_ReferenceActionByMatchSel";
        }

        public override bool IsValid()
        {
            return MatchIds.Length > 0 ;
        }
    }
}
