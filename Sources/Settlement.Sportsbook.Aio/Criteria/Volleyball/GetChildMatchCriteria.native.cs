using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Aio.Criteria.Volleyball
{
    public class GetChildMatchCriteria : CriteriaBase
    {
        public int MatchId { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_ChildMatchSel";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}