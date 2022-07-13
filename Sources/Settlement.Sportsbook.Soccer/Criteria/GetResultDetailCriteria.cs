using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criteria
{
    public class GetResultDetailCriteria : CriteriaBase
    {
        public int MatchId { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_ResultDetailSel ";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}