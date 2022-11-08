using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Aio.Criteria.Cricket
{
    
    public class GetPlayerInfoCriteria : CriteriaBase
    {
        public int MatchId { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_PlayerInfoSel";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }

}
