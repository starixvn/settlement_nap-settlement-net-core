using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Aio.Criteria.ESport
{
    public class GetOldMatchCriteria : CriteriaBase
    {
        public int MatchId { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_MatchSelBetDaq";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}