using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Aio.Criterias
{
    public class GetRecalMatchCriteria : CriteriaBase
    {
        public int MatchId { get; set; }

        public int SportType { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_MatchSelDetail_Resources_ReCal";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}
