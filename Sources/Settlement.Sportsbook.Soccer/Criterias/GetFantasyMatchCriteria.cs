using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criterias
{
    public class GetFantasyMatchCriteria : CriteriaBase
    {
        public int MatchId { get; set; }

        public override string GetSettingKey()
        {
            return "Nap_Set_FantasyMatchSel";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}