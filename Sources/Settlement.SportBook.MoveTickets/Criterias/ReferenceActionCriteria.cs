using Fanex.Data.Repository;

namespace Settlement.Sportsbook.MoveTickets.Criterias
{
    public class ReferenceActionCriteria : CriteriaBase
    {
        public string MatchIds { get; set; }

        public string ActionIds { get; } = "81025,81026";

        public override string GetSettingKey()
        {
            return "NAP_Set_AutoPayout_ReferenceActionByMatchSel";
        }

        public override bool IsValid()
        {
            return MatchIds.Length > 0;
        }
    }
}